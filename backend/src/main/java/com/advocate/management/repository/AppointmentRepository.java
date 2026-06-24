package com.advocate.management.repository;

import com.advocate.management.entity.Appointment;
import com.advocate.management.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Repository interface for managing Appointment entities.
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Find appointments where user is the client.
     */
    List<Appointment> findByClientId(Long clientId);

    /**
     * Find appointments where user is the lawyer.
     */
    List<Appointment> findByLawyerId(Long lawyerId);

    /**
     * Find upcoming appointments for a lawyer.
     */
    @Query("SELECT a FROM Appointment a WHERE a.lawyer.id = :lawyerId AND a.status = :status AND " +
           "(a.date > CURRENT_DATE OR (a.date = CURRENT_DATE AND a.startTime >= CURRENT_TIME)) ORDER BY a.date ASC, a.startTime ASC")
    List<Appointment> findUpcomingLawyerAppointments(@Param("lawyerId") Long lawyerId, @Param("status") AppointmentStatus status);

    /**
     * Count appointments for dashboard statistics.
     */
    long countByLawyerIdAndStatus(Long lawyerId, AppointmentStatus status);

    /**
     * Count unique clients for a lawyer.
     */
    @Query("SELECT COUNT(DISTINCT a.client.id) FROM Appointment a WHERE a.lawyer.id = :lawyerId")
    long countUniqueClientsByLawyerId(@Param("lawyerId") Long lawyerId);

    /**
     * Check if a lawyer has any active overlapping appointments on a date and time slot.
     * Overlap condition: (start1 < end2) AND (end1 > start2)
     * Status condition: Only check appointments that are not REJECTED or CANCELLED.
     */
    @Query("SELECT a FROM Appointment a WHERE a.lawyer.id = :lawyerId AND a.date = :date " +
           "AND a.status NOT IN (com.advocate.management.enums.AppointmentStatus.REJECTED, com.advocate.management.enums.AppointmentStatus.CANCELLED) " +
           "AND a.startTime < :endTime AND a.endTime > :startTime")
    List<Appointment> findOverlappingAppointments(
            @Param("lawyerId") Long lawyerId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    /**
     * Check overlapping appointments for a lawyer, excluding a specific appointment ID (for reschedule validation).
     */
    @Query("SELECT a FROM Appointment a WHERE a.lawyer.id = :lawyerId AND a.date = :date " +
           "AND a.id <> :excludeId " +
           "AND a.status NOT IN (com.advocate.management.enums.AppointmentStatus.REJECTED, com.advocate.management.enums.AppointmentStatus.CANCELLED) " +
           "AND a.startTime < :endTime AND a.endTime > :startTime")
    List<Appointment> findOverlappingAppointmentsExcludeSelf(
            @Param("lawyerId") Long lawyerId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId);
}
