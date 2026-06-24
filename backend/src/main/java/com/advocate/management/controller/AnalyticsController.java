package com.advocate.management.controller;

import com.advocate.management.dto.AnalyticsDTO;
import com.advocate.management.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<AnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getLawyerAnalytics());
    }
}
