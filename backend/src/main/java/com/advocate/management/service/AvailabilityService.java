package com.advocate.management.service;

import com.advocate.management.dto.AvailabilityDTO;
import com.advocate.management.entity.Availability;
import com.advocate.management.entity.User;
import com.advocate.management.enums.AvailabilityStatus;
import com.advocate.management.enums.Role;
import com.advocate.management.exception.BadRequestException;
import com.advocate.management.exception.ResourceNotFoundException;
import com.advocate.management.repository.AvailabilityRepository;
import com.advocate.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    public User getLawyer() {
        return userRepository.findByRole(Role.ROLE_LAWYER).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer user not found in the system"));
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    @Transactional
    public AvailabilityDTO createSlot(AvailabilityDTO dto) {
        User lawyer = getAuthenticatedUser();
        if (lawyer.getRole() != Role.ROLE_LAWYER) {
            throw new BadRequestException("Only lawyers can set availability");
        }

        validateTimes(dto.getStartTime(), dto.getEndTime());

        // Check overlapping slots
        List<Availability> overlap = availabilityRepository.findOverlappingSlots(
                lawyer.getId(), dto.getDate(), dto.getStartTime(), dto.getEndTime()
        );
        if (!overlap.isEmpty()) {
            throw new BadRequestException("An availability slot already overlaps with this time range");
        }

        Availability availability = Availability.builder()
                .lawyer(lawyer)
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status(AvailabilityStatus.valueOf(dto.getStatus().toUpperCase()))
                .description(dto.getDescription())
                .build();

        availabilityRepository.save(availability);
        return mapToDTO(availability);
    }

    @Transactional
    public List<AvailabilityDTO> createRecurringSlots(
            List<String> daysOfWeek, // e.g. "MONDAY", "TUESDAY"
            LocalTime startTime,
            LocalTime endTime,
            int weeksAhead,
            String statusStr,
            String description
    ) {
        User lawyer = getAuthenticatedUser();
        if (lawyer.getRole() != Role.ROLE_LAWYER) {
            throw new BadRequestException("Only lawyers can set availability");
        }

        validateTimes(startTime, endTime);
        AvailabilityStatus status = AvailabilityStatus.valueOf(statusStr.toUpperCase());

        List<Availability> slotsToSave = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 0; i < weeksAhead * 7; i++) {
            LocalDate date = today.plusDays(i);
            String dayName = date.getDayOfWeek().name();
            if (daysOfWeek.contains(dayName)) {
                // Check overlaps
                List<Availability> overlap = availabilityRepository.findOverlappingSlots(
                        lawyer.getId(), date, startTime, endTime
                );
                if (overlap.isEmpty()) {
                    slotsToSave.add(
                            Availability.builder()
                                    .lawyer(lawyer)
                                    .date(date)
                                    .startTime(startTime)
                                    .endTime(endTime)
                                    .status(status)
                                    .description(description)
                                    .build()
                    );
                }
            }
        }

        availabilityRepository.saveAll(slotsToSave);
        return slotsToSave.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<AvailabilityDTO> getAvailability(LocalDate startDate, LocalDate endDate) {
        User lawyer = getLawyer(); // Works for both client and lawyer
        List<Availability> slots;
        if (startDate != null && endDate != null) {
            slots = availabilityRepository.findByLawyerIdAndDateBetween(lawyer.getId(), startDate, endDate);
        } else {
            slots = availabilityRepository.findByLawyerId(lawyer.getId());
        }
        return slots.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<AvailabilityDTO> getAvailabilityForDate(LocalDate date) {
        User lawyer = getLawyer();
        return availabilityRepository.findByLawyerIdAndDate(lawyer.getId(), date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSlot(Long id) {
        User lawyer = getAuthenticatedUser();
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!availability.getLawyer().getId().equals(lawyer.getId())) {
            throw new BadRequestException("You can only delete your own availability slots");
        }

        availabilityRepository.delete(availability);
    }

    private void validateTimes(LocalTime start, LocalTime end) {
        if (start.isAfter(end) || start.equals(end)) {
            throw new BadRequestException("Start time must be before end time");
        }
    }

    private AvailabilityDTO mapToDTO(Availability entity) {
        return AvailabilityDTO.builder()
                .id(entity.getId())
                .lawyerId(entity.getLawyer().getId())
                .date(entity.getDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .status(entity.getStatus().name())
                .description(entity.getDescription())
                .build();
    }
}
