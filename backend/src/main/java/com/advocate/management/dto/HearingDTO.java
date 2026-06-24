package com.advocate.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HearingDTO {

    private Long id;

    @NotNull(message = "Case ID is required")
    private Long caseId;

    private String caseTitle;

    private String caseNumber;

    @NotNull(message = "Hearing date and time are required")
    private LocalDateTime hearingDate;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @NotBlank(message = "Status is required")
    private String status; // SCHEDULED, ADJOURNED, CONCLUDED

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
