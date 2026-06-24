package com.advocate.management.entity;

import com.advocate.management.enums.AvailabilityStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entity representing a Lawyer's availability configuration.
 */
@Entity
@Table(name = "availabilities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private User lawyer;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AvailabilityStatus status;

    private String description;
}
