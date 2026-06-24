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
public class CaseTimelineDTO {

    private Long id;

    @NotNull(message = "Case ID is required")
    private Long caseId;

    @NotBlank(message = "Timeline title is required")
    private String title;

    @NotBlank(message = "Timeline description is required")
    private String description;

    @NotNull(message = "Event date is required")
    private LocalDateTime eventDate;

    private LocalDateTime createdAt;
}
