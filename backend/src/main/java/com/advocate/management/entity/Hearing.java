package com.advocate.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "hearings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hearing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private LawCase lawCase;

    @Column(nullable = false)
    private LocalDateTime hearingDate;

    @Column(nullable = false)
    private String purpose;

    @Column(nullable = false)
    private String status; // e.g. SCHEDULED, ADJOURNED, CONCLUDED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
