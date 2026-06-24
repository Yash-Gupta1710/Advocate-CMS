package com.advocate.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    private long totalClients;
    private long totalCases;
    private Map<String, Long> casesByStatus;
    private Map<String, Long> casesByPriority;
    private Map<String, Long> appointmentsByStatus;
    private long upcomingHearingsCount;
}
