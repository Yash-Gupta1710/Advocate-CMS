package com.advocate.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "case_timeline")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private LawCase lawCase;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
