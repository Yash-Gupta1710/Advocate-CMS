package com.advocate.management.repository;

import com.advocate.management.entity.CaseTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseTimelineRepository extends JpaRepository<CaseTimeline, Long> {

    List<CaseTimeline> findByLawCaseIdOrderByEventDateDesc(Long caseId);
}
