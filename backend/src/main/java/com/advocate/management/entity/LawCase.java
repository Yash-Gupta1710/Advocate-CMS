package com.advocate.management.entity;

import com.advocate.management.enums.CasePriority;
import com.advocate.management.enums.CaseStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"timeline", "hearings"})
@EqualsAndHashCode(exclude = {"timeline", "hearings"})
@SuppressWarnings("unused")
public class LawCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String caseNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private User lawyer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CasePriority priority;

    @Column(nullable = false)
    private String courtName;

    private String judgeName;

    @Column(nullable = false)
    private LocalDate filingDate;

    private String opposingParty;

    private String opposingAdvocate;

    @OneToMany(mappedBy = "lawCase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private final List<CaseTimeline> timeline = new ArrayList<>();

    @OneToMany(mappedBy = "lawCase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private final List<Hearing> hearings = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
