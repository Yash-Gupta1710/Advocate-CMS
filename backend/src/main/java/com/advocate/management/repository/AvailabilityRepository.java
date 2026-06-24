package com.advocate.management.repository;

import com.advocate.management.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Repository interface for managing Availability entities.
 */
@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    /**
     * Finds all availability slots for a lawyer.
     *
     * @param lawyerId the lawyer's ID
     * @return list of availability slots
     */
    List<Availability> findByLawyerId(Long lawyerId);

    /**
     * Finds availability slots for a lawyer on a specific date.
     *
     * @param lawyerId the lawyer's ID
     * @param date the date to check
     * @return list of availability slots for that day
     */
    List<Availability> findByLawyerIdAndDate(Long lawyerId, LocalDate date);

    /**
     * Finds availability slots for a lawyer within a date range.
     *
     * @param lawyerId the lawyer's ID
     * @param startDate the start date
     * @param endDate the end date
     * @return list of availability slots
     */
    List<Availability> findByLawyerIdAndDateBetween(Long lawyerId, LocalDate startDate, LocalDate endDate);

    /**
     * Checks if there are overlapping availability configurations for a lawyer on a date and time.
     */
    @Query("SELECT a FROM Availability a WHERE a.lawyer.id = :lawyerId AND a.date = :date AND " +
           "((a.startTime < :endTime AND a.endTime > :startTime))")
    List<Availability> findOverlappingSlots(
            @Param("lawyerId") Long lawyerId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}
