package com.advocate.management.service;

import com.advocate.management.dto.AnalyticsDTO;
import com.advocate.management.entity.Hearing;
import com.advocate.management.entity.LawCase;
import com.advocate.management.entity.User;
import com.advocate.management.enums.Role;
import com.advocate.management.exception.ResourceNotFoundException;
import com.advocate.management.repository.AppointmentRepository;
import com.advocate.management.repository.HearingRepository;
import com.advocate.management.repository.LawCaseRepository;
import com.advocate.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final LawCaseRepository lawCaseRepository;
    private final AppointmentRepository appointmentRepository;
    private final HearingRepository hearingRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public AnalyticsDTO getLawyerAnalytics() {
        User lawyer = getAuthenticatedUser();
        
        long totalClients = userRepository.findByRole(Role.ROLE_CLIENT).size();
        
        List<LawCase> cases = lawCaseRepository.findByLawyerId(lawyer.getId());
        long totalCases = cases.size();

        Map<String, Long> casesByStatus = cases.stream()
                .collect(Collectors.groupingBy(c -> c.getStatus().name(), Collectors.counting()));

        Map<String, Long> casesByPriority = cases.stream()
                .collect(Collectors.groupingBy(c -> c.getPriority().name(), Collectors.counting()));

        var appointments = appointmentRepository.findByLawyerId(lawyer.getId());
        Map<String, Long> appointmentsByStatus = appointments.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));

        long upcomingHearings = hearingRepository.findByLawCaseLawyerIdAndHearingDateAfterOrderByHearingDateAsc(
                lawyer.getId(), LocalDateTime.now()
        ).size();

        return AnalyticsDTO.builder()
                .totalClients(totalClients)
                .totalCases(totalCases)
                .casesByStatus(casesByStatus)
                .casesByPriority(casesByPriority)
                .appointmentsByStatus(appointmentsByStatus)
                .upcomingHearingsCount(upcomingHearings)
                .build();
    }
}
