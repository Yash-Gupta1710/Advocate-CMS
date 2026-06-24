package com.advocate.management.repository;

import com.advocate.management.entity.LawCase;
import com.advocate.management.enums.CaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LawCaseRepository extends JpaRepository<LawCase, Long>, JpaSpecificationExecutor<LawCase> {

    List<LawCase> findByClientId(Long clientId);

    List<LawCase> findByLawyerId(Long lawyerId);

    List<LawCase> findByClientIdAndStatus(Long clientId, CaseStatus status);

    List<LawCase> findByLawyerIdAndStatus(Long lawyerId, CaseStatus status);

    Optional<LawCase> findByCaseNumber(String caseNumber);

    boolean existsByCaseNumber(String caseNumber);
}
