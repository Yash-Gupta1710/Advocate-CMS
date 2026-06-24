package com.advocate.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing uploaded file metadata stored in the database.
 */
@Entity
@Table(name = "uploaded_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String originalFilename;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Long size;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String category; // e.g. AADHAAR, PAN, PROPERTY_DEED, COURT_ORDER, AGREEMENT, OTHER

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id")
    private LawCase lawCase;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime uploadedAt;
}
