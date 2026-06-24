package com.advocate.management.service;

import com.advocate.management.dto.AppointmentDTO;
import com.advocate.management.entity.Appointment;
import com.advocate.management.entity.User;
import com.advocate.management.enums.AppointmentStatus;
import com.advocate.management.enums.AvailabilityStatus;
import com.advocate.management.enums.Role;
import com.advocate.management.exception.BadRequestException;
import com.advocate.management.exception.DoubleBookingException;
import com.advocate.management.exception.ResourceNotFoundException;
import com.advocate.management.repository.AppointmentRepository;
import com.advocate.management.repository.AvailabilityRepository;
import com.advocate.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service handling appointment lifecycle: request, approve, reject, reschedule, cancel, complete.
 * Enforces double-booking prevention and validates availability slots.
 */
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AvailabilityRepository availabilityRepository;
    private final NotificationService notificationService;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private User getLawyer() {
        return userRepository.findByRole(Role.ROLE_LAWYER).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer user not found"));
    }

    /**
     * Client requests a new appointment. Validates time slot and prevents double booking.
     */
    @Transactional
    public AppointmentDTO requestAppointment(AppointmentDTO dto) {
        User client = getAuthenticatedUser();
        if (client.getRole() != Role.ROLE_CLIENT) {
            throw new BadRequestException("Only clients can request appointments");
        }

        User lawyer = getLawyer();

        // Check that the lawyer has an AVAILABLE slot on this date/time
        var availableSlots = availabilityRepository.findByLawyerIdAndDate(lawyer.getId(), dto.getDate());
        boolean hasAvailableSlot = availableSlots.stream()
                .anyMatch(s -> s.getStatus() == AvailabilityStatus.AVAILABLE
                         && !s.getStartTime().isAfter(dto.getStartTime())
                         && !s.getEndTime().isBefore(dto.getEndTime()));
        if (!hasAvailableSlot) {
            throw new BadRequestException("Lawyer is not available at the requested time slot");
        }

        // Prevent double booking
        List<Appointment> overlapping = appointmentRepository.findOverlappingAppointments(
                lawyer.getId(), dto.getDate(), dto.getStartTime(), dto.getEndTime()
        );
        if (!overlapping.isEmpty()) {
            throw new DoubleBookingException("This time slot is already booked. Please select another.");
        }

        Appointment appointment = Appointment.builder()
                .client(client)
                .lawyer(lawyer)
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status(AppointmentStatus.REQUESTED)
                .description(dto.getDescription())
                .build();

        appointmentRepository.save(appointment);
        
        // Notify lawyer
        notificationService.sendNotification(lawyer, "New appointment request from client: " + client.getFullName() + " for " + dto.getDate() + " at " + dto.getStartTime());

        return mapToDTO(appointment);
    }

    /**
     * Lawyer approves a pending appointment.
     */
    @Transactional
    public AppointmentDTO approveAppointment(Long id) {
        User lawyer = getAuthenticatedUser();
        Appointment appointment = getAppointmentById(id);
        validateLawyerOwnership(lawyer, appointment);

        if (appointment.getStatus() != AppointmentStatus.REQUESTED) {
            throw new BadRequestException("Only REQUESTED appointments can be approved");
        }

        // Re-check double booking at approval time
        List<Appointment> overlapping = appointmentRepository.findOverlappingAppointmentsExcludeSelf(
                lawyer.getId(), appointment.getDate(),
                appointment.getStartTime(), appointment.getEndTime(), id
        );
        if (!overlapping.isEmpty()) {
            throw new DoubleBookingException("Another appointment already exists in this time slot");
        }

        appointment.setStatus(AppointmentStatus.APPROVED);
        appointmentRepository.save(appointment);

        // Notify client
        notificationService.sendNotification(appointment.getClient(), "Your appointment request for " + appointment.getDate() + " at " + appointment.getStartTime() + " has been APPROVED.");

        return mapToDTO(appointment);
    }

    /**
     * Lawyer rejects a pending appointment with a reason.
     */
    @Transactional
    public AppointmentDTO rejectAppointment(Long id, String reason) {
        User lawyer = getAuthenticatedUser();
        Appointment appointment = getAppointmentById(id);
        validateLawyerOwnership(lawyer, appointment);

        if (appointment.getStatus() != AppointmentStatus.REQUESTED) {
            throw new BadRequestException("Only REQUESTED appointments can be rejected");
        }

        appointment.setStatus(AppointmentStatus.REJECTED);
        appointment.setRejectionReason(reason);
        appointmentRepository.save(appointment);

        // Notify client
        notificationService.sendNotification(appointment.getClient(), "Your appointment request for " + appointment.getDate() + " has been REJECTED. Reason: " + reason);

        return mapToDTO(appointment);
    }

    /**
     * Lawyer reschedules an appointment to a new date/time, with double-booking checks.
     */
    @Transactional
    public AppointmentDTO rescheduleAppointment(Long id, AppointmentDTO dto) {
        User lawyer = getAuthenticatedUser();
        Appointment appointment = getAppointmentById(id);
        validateLawyerOwnership(lawyer, appointment);

        // Prevent double booking for the new slot
        List<Appointment> overlapping = appointmentRepository.findOverlappingAppointmentsExcludeSelf(
                lawyer.getId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), id
        );
        if (!overlapping.isEmpty()) {
            throw new DoubleBookingException("The new time slot conflicts with an existing appointment");
        }

        appointment.setDate(dto.getDate());
        appointment.setStartTime(dto.getStartTime());
        appointment.setEndTime(dto.getEndTime());
        appointment.setStatus(AppointmentStatus.RESCHEDULED);
        appointmentRepository.save(appointment);

        // Notify client
        notificationService.sendNotification(appointment.getClient(), "Your appointment has been rescheduled to " + dto.getDate() + " at " + dto.getStartTime());

        return mapToDTO(appointment);
    }

    /**
     * Client or Lawyer cancels an appointment.
     */
    @Transactional
    public AppointmentDTO cancelAppointment(Long id, String reason) {
        User user = getAuthenticatedUser();
        Appointment appointment = getAppointmentById(id);

        // Either the client or the lawyer can cancel
        if (!appointment.getClient().getId().equals(user.getId())
                && !appointment.getLawyer().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to cancel this appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointmentRepository.save(appointment);

        // Notify other party
        User recipient = user.getId().equals(appointment.getClient().getId()) ? appointment.getLawyer() : appointment.getClient();
        notificationService.sendNotification(recipient, "Appointment on " + appointment.getDate() + " has been CANCELLED by " + user.getFullName() + ". Reason: " + reason);

        return mapToDTO(appointment);
    }

    /**
     * Lawyer marks an appointment as completed.
     */
    @Transactional
    public AppointmentDTO completeAppointment(Long id) {
        User lawyer = getAuthenticatedUser();
        Appointment appointment = getAppointmentById(id);
        validateLawyerOwnership(lawyer, appointment);

        if (appointment.getStatus() != AppointmentStatus.APPROVED
                && appointment.getStatus() != AppointmentStatus.RESCHEDULED) {
            throw new BadRequestException("Only APPROVED or RESCHEDULED appointments can be completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // Notify client
        notificationService.sendNotification(appointment.getClient(), "Your consultation on " + appointment.getDate() + " has been marked as COMPLETED.");

        return mapToDTO(appointment);
    }

    /**
     * Get all appointments for the authenticated user (filtered by role).
     */
    public List<AppointmentDTO> getMyAppointments() {
        User user = getAuthenticatedUser();
        List<Appointment> appointments;
        if (user.getRole() == Role.ROLE_LAWYER) {
            appointments = appointmentRepository.findByLawyerId(user.getId());
        } else {
            appointments = appointmentRepository.findByClientId(user.getId());
        }
        return appointments.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Get a single appointment by ID. Both client and lawyer can view if they own it.
     */
    public AppointmentDTO getAppointment(Long id) {
        User user = getAuthenticatedUser();
        Appointment appointment = getAppointmentById(id);

        if (!appointment.getClient().getId().equals(user.getId())
                && !appointment.getLawyer().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to view this appointment");
        }
        return mapToDTO(appointment);
    }

    /**
     * Dashboard stat: count by status for a lawyer.
     */
    public long countByStatus(AppointmentStatus status) {
        User lawyer = getLawyer();
        return appointmentRepository.countByLawyerIdAndStatus(lawyer.getId(), status);
    }

    /**
     * Dashboard stat: count unique clients.
     */
    public long countUniqueClients() {
        User lawyer = getLawyer();
        return appointmentRepository.countUniqueClientsByLawyerId(lawyer.getId());
    }

    // --- Helper Methods ---

    private Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
    }

    private void validateLawyerOwnership(User lawyer, Appointment appointment) {
        if (lawyer.getRole() != Role.ROLE_LAWYER) {
            throw new BadRequestException("Only a lawyer can perform this action");
        }
        if (!appointment.getLawyer().getId().equals(lawyer.getId())) {
            throw new BadRequestException("This appointment does not belong to you");
        }
    }

    private AppointmentDTO mapToDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .clientId(appointment.getClient().getId())
                .clientName(appointment.getClient().getFullName())
                .clientEmail(appointment.getClient().getEmail())
                .lawyerId(appointment.getLawyer().getId())
                .lawyerName(appointment.getLawyer().getFullName())
                .date(appointment.getDate())
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus().name())
                .description(appointment.getDescription())
                .rejectionReason(appointment.getRejectionReason())
                .cancellationReason(appointment.getCancellationReason())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
}
