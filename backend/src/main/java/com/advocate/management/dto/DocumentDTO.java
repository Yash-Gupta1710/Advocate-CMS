package com.advocate.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private Long id;
    private String filename;
    private String originalFilename;
    private String contentType;
    private Long size;
    private String category;
    private Long ownerId;
    private String ownerName;
    private Long caseId;
    private String caseTitle;
    private LocalDateTime uploadedAt;
}
