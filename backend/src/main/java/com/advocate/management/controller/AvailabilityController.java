package com.advocate.management.controller;

import com.advocate.management.dto.AvailabilityDTO;
import com.advocate.management.service.AvailabilityService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<AvailabilityDTO> createSlot(@Valid @RequestBody AvailabilityDTO dto) {
        return ResponseEntity.ok(availabilityService.createSlot(dto));
    }

    @PostMapping("/recurring")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<List<AvailabilityDTO>> createRecurring(
            @Valid @RequestBody RecurringRequest request
    ) {
        List<AvailabilityDTO> created = availabilityService.createRecurringSlots(
                request.getDaysOfWeek(),
                request.getStartTime(),
                request.getEndTime(),
                request.getWeeksAhead(),
                request.getStatus(),
                request.getDescription()
        );
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<AvailabilityDTO>> getAvailability(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(availabilityService.getAvailability(startDate, endDate));
    }

    @GetMapping("/date")
    public ResponseEntity<List<AvailabilityDTO>> getAvailabilityForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(availabilityService.getAvailabilityForDate(date));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<Map<String, String>> deleteSlot(@PathVariable Long id) {
        availabilityService.deleteSlot(id);
        return ResponseEntity.ok(Map.of("message", "Availability slot deleted successfully"));
    }

    @Data
    public static class RecurringRequest {
        @NotNull
        private List<String> daysOfWeek;

        @NotNull
        private LocalTime startTime;

        @NotNull
        private LocalTime endTime;

        private int weeksAhead = 4; // Default to 4 weeks ahead

        @NotNull
        private String status = "AVAILABLE";

        private String description;
    }
}
