package com.advocate.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseDTO {

    private Long id;

    @NotBlank(message = "Case number is required")
    private String caseNumber;

    @NotBlank(message = "Case title is required")
    private String title;

    private String description;

    @NotNull(message = "Client ID is required")
    private Long clientId;

    private String clientName;

    private Long lawyerId;

    private String lawyerName;

    @NotBlank(message = "Status is required")
    private String status; // PENDING, ACTIVE, DISPOSED, APPEALED

    @NotBlank(message = "Priority is required")
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @NotBlank(message = "Court name is required")
    private String courtName;

    private String judgeName;

    @NotNull(message = "Filing date is required")
    private LocalDate filingDate;

    private String opposingParty;

    private String opposingAdvocate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
