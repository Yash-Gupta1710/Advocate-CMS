package com.advocate.management.controller;

import com.advocate.management.dto.AppointmentDTO;
import com.advocate.management.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /** Client requests a new appointment. */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CLIENT')")
    public ResponseEntity<AppointmentDTO> requestAppointment(@Valid @RequestBody AppointmentDTO dto) {
        return ResponseEntity.ok(appointmentService.requestAppointment(dto));
    }

    /** Get all appointments for the authenticated user. */
    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getMyAppointments() {
        return ResponseEntity.ok(appointmentService.getMyAppointments());
    }

    /** Get a single appointment. */
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointment(id));
    }

    /** Lawyer approves a pending appointment. */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<AppointmentDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.approveAppointment(id));
    }

    /** Lawyer rejects a pending appointment. */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<AppointmentDTO> reject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(id, body.get("reason")));
    }

    /** Lawyer reschedules an appointment. */
    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<AppointmentDTO> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentDTO dto
    ) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, dto));
    }

    /** Client or Lawyer cancels an appointment. */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentDTO> cancel(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id, body.get("reason")));
    }

    /** Lawyer marks appointment as completed. */
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<AppointmentDTO> complete(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.completeAppointment(id));
    }
}
