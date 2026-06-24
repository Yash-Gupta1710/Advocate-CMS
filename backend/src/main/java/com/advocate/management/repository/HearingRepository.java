package com.advocate.management.repository;

import com.advocate.management.entity.Hearing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HearingRepository extends JpaRepository<Hearing, Long> {

    List<Hearing> findByLawCaseIdOrderByHearingDateAsc(Long caseId);

    List<Hearing> findByLawCaseLawyerIdAndHearingDateAfterOrderByHearingDateAsc(Long lawyerId, LocalDateTime dateTime);

    List<Hearing> findByLawCaseClientIdAndHearingDateAfterOrderByHearingDateAsc(Long clientId, LocalDateTime dateTime);
}
