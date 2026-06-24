package com.advocate.management.controller;

import com.advocate.management.dto.CaseDTO;
import com.advocate.management.dto.CaseTimelineDTO;
import com.advocate.management.dto.HearingDTO;
import com.advocate.management.service.CaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    // --- Case CRUD Endpoints ---

    @PostMapping("/cases")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<CaseDTO> createCase(@Valid @RequestBody CaseDTO dto) {
        return ResponseEntity.ok(caseService.createCase(dto));
    }

    @PutMapping("/cases/{id}")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<CaseDTO> updateCase(@PathVariable Long id, @Valid @RequestBody CaseDTO dto) {
        return ResponseEntity.ok(caseService.updateCase(id, dto));
    }

    @DeleteMapping("/cases/{id}")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<Map<String, String>> deleteCase(@PathVariable Long id) {
        caseService.deleteCase(id);
        return ResponseEntity.ok(Map.of("message", "Case deleted successfully"));
    }

    @GetMapping("/cases")
    public ResponseEntity<List<CaseDTO>> getMyCases() {
        return ResponseEntity.ok(caseService.getMyCases());
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<CaseDTO> getCaseById(@PathVariable Long id) {
        return ResponseEntity.ok(caseService.getCaseById(id));
    }

    // --- Case Timeline Endpoints ---

    @PostMapping("/cases/{id}/timeline")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<CaseTimelineDTO> addTimelineEvent(
            @PathVariable Long id,
            @Valid @RequestBody CaseTimelineDTO dto
    ) {
        return ResponseEntity.ok(caseService.addTimelineEvent(id, dto));
    }

    @GetMapping("/cases/{id}/timeline")
    public ResponseEntity<List<CaseTimelineDTO>> getTimelineForCase(@PathVariable Long id) {
        return ResponseEntity.ok(caseService.getTimelineForCase(id));
    }

    // --- Hearing Endpoints ---

    @PostMapping("/cases/{id}/hearings")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<HearingDTO> scheduleHearing(
            @PathVariable Long id,
            @Valid @RequestBody HearingDTO dto
    ) {
        return ResponseEntity.ok(caseService.scheduleHearing(id, dto));
    }

    @GetMapping("/cases/{id}/hearings")
    public ResponseEntity<List<HearingDTO>> getHearingsForCase(@PathVariable Long id) {
        return ResponseEntity.ok(caseService.getHearingsForCase(id));
    }

    @PutMapping("/hearings/{hearingId}/status")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<HearingDTO> updateHearingStatus(
            @PathVariable Long hearingId,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        String notes = body.get("notes");
        return ResponseEntity.ok(caseService.updateHearingStatus(hearingId, status, notes));
    }

    @GetMapping("/hearings/upcoming")
    public ResponseEntity<List<HearingDTO>> getUpcomingHearings() {
        return ResponseEntity.ok(caseService.getUpcomingHearings());
    }
}
