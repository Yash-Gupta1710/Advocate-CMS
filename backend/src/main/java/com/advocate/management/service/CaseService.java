package com.advocate.management.service;

import com.advocate.management.dto.CaseDTO;
import com.advocate.management.dto.CaseTimelineDTO;
import com.advocate.management.dto.HearingDTO;
import com.advocate.management.entity.CaseTimeline;
import com.advocate.management.entity.Hearing;
import com.advocate.management.entity.LawCase;
import com.advocate.management.entity.User;
import com.advocate.management.enums.CasePriority;
import com.advocate.management.enums.CaseStatus;
import com.advocate.management.enums.Role;
import com.advocate.management.exception.BadRequestException;
import com.advocate.management.exception.ResourceNotFoundException;
import com.advocate.management.repository.CaseTimelineRepository;
import com.advocate.management.repository.HearingRepository;
import com.advocate.management.repository.LawCaseRepository;
import com.advocate.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final LawCaseRepository lawCaseRepository;
    private final CaseTimelineRepository caseTimelineRepository;
    private final HearingRepository hearingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private User getLawyer() {
        return userRepository.findByRole(Role.ROLE_LAWYER).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer user not found"));
    }

    // --- Case Management ---

    @Transactional
    public CaseDTO createCase(CaseDTO dto) {
        User lawyer = getAuthenticatedUser();
        if (lawyer.getRole() != Role.ROLE_LAWYER) {
            throw new BadRequestException("Only lawyers can register cases");
        }

        if (lawCaseRepository.existsByCaseNumber(dto.getCaseNumber())) {
            throw new BadRequestException("Case number already exists: " + dto.getCaseNumber());
        }

        User client = userRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID: " + dto.getClientId()));

        if (client.getRole() != Role.ROLE_CLIENT) {
            throw new BadRequestException("Selected user is not a client");
        }

        LawCase lawCase = LawCase.builder()
                .caseNumber(dto.getCaseNumber())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .client(client)
                .lawyer(lawyer)
                .status(CaseStatus.valueOf(dto.getStatus().toUpperCase()))
                .priority(CasePriority.valueOf(dto.getPriority().toUpperCase()))
                .courtName(dto.getCourtName())
                .judgeName(dto.getJudgeName())
                .filingDate(dto.getFilingDate())
                .opposingParty(dto.getOpposingParty())
                .opposingAdvocate(dto.getOpposingAdvocate())
                .build();

        lawCase = lawCaseRepository.save(lawCase);

        // Auto-seed initial timeline event
        CaseTimeline initialEvent = CaseTimeline.builder()
                .lawCase(lawCase)
                .title("Case Registered")
                .description("The case was registered under status: " + lawCase.getStatus())
                .eventDate(LocalDateTime.now())
                .build();
        caseTimelineRepository.save(initialEvent);

        // Notify Client
        notificationService.sendNotification(client, "A new case file has been registered for you: " + lawCase.getTitle() + " (" + lawCase.getCaseNumber() + ").");

        return mapToDTO(lawCase);
    }

    @Transactional
    public CaseDTO updateCase(Long id, CaseDTO dto) {
        User lawyer = getAuthenticatedUser();
        if (lawyer.getRole() != Role.ROLE_LAWYER) {
            throw new BadRequestException("Only lawyers can update cases");
        }

        LawCase lawCase = lawCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + id));

        // Check if caseNumber is changing and already exists
        if (!lawCase.getCaseNumber().equals(dto.getCaseNumber()) &&
                lawCaseRepository.existsByCaseNumber(dto.getCaseNumber())) {
            throw new BadRequestException("Case number already exists: " + dto.getCaseNumber());
        }

        CaseStatus oldStatus = lawCase.getStatus();
        CaseStatus newStatus = CaseStatus.valueOf(dto.getStatus().toUpperCase());

        lawCase.setCaseNumber(dto.getCaseNumber());
        lawCase.setTitle(dto.getTitle());
        lawCase.setDescription(dto.getDescription());
        lawCase.setStatus(newStatus);
        lawCase.setPriority(CasePriority.valueOf(dto.getPriority().toUpperCase()));
        lawCase.setCourtName(dto.getCourtName());
        lawCase.setJudgeName(dto.getJudgeName());
        lawCase.setFilingDate(dto.getFilingDate());
        lawCase.setOpposingParty(dto.getOpposingParty());
        lawCase.setOpposingAdvocate(dto.getOpposingAdvocate());

        lawCase = lawCaseRepository.save(lawCase);

        // Log to timeline if status changed
        if (oldStatus != newStatus) {
            CaseTimeline statusChangeEvent = CaseTimeline.builder()
                    .lawCase(lawCase)
                    .title("Status Changed")
                    .description("Case status updated from " + oldStatus + " to " + newStatus)
                    .eventDate(LocalDateTime.now())
                    .build();
            caseTimelineRepository.save(statusChangeEvent);

            // Notify Client
            notificationService.sendNotification(lawCase.getClient(), "The status of your case '" + lawCase.getTitle() + "' has been updated to: " + newStatus);
        }

        return mapToDTO(lawCase);
    }

    @Transactional
    public void deleteCase(Long id) {
        User lawyer = getAuthenticatedUser();
        if (lawyer.getRole() != Role.ROLE_LAWYER) {
            throw new BadRequestException("Only lawyers can delete cases");
        }
        LawCase lawCase = lawCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + id));
        
        // Notify Client first before delete
        notificationService.sendNotification(lawCase.getClient(), "Your case profile '" + lawCase.getTitle() + "' has been closed and removed by the administrator.");
        
        lawCaseRepository.delete(lawCase);
    }

    public List<CaseDTO> getMyCases() {
        User user = getAuthenticatedUser();
        List<LawCase> cases;
        if (user.getRole() == Role.ROLE_LAWYER) {
            cases = lawCaseRepository.findByLawyerId(user.getId());
        } else {
            cases = lawCaseRepository.findByClientId(user.getId());
        }
        return cases.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public CaseDTO getCaseById(Long id) {
        User user = getAuthenticatedUser();
        LawCase lawCase = lawCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + id));

        // Enforce privacy: only owner lawyer or client can view
        if (!lawCase.getClient().getId().equals(user.getId()) &&
                !lawCase.getLawyer().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to view this case");
        }

        return mapToDTO(lawCase);
    }

    // --- Timeline Events ---

    @Transactional
    public CaseTimelineDTO addTimelineEvent(Long caseId, CaseTimelineDTO dto) {
        User lawyer = getAuthenticatedUser();
        if (lawyer.getRole() != Role.ROLE_LAWYER) {
            throw new BadRequestException("Only lawyers can add timeline events");
        }

        LawCase lawCase = lawCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        CaseTimeline event = CaseTimeline.builder()
                .lawCase(lawCase)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .eventDate(dto.getEventDate() != null ? dto.getEventDate() : LocalDateTime.now())
                .build();

        event = caseTimelineRepository.save(event);
        return mapToTimelineDTO(event);
    }

    public List<CaseTimelineDTO> getTimelineForCase(Long caseId) {
        User user = getAuthenticatedUser();
        LawCase lawCase = lawCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (!lawCase.getClient().getId().equals(user.getId()) &&
                !lawCase.getLawyer().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to view this timeline");
        }

        return caseTimelineRepository.findByLawCaseIdOrderByEventDateDesc(caseId)
                .stream()
                .map(this::mapToTimelineDTO)
                .collect(Collectors.toList());
    }

    // --- Hearing Management ---

    @Transactional
    public HearingDTO scheduleHearing(Long caseId, HearingDTO dto) {
        User lawyer = getAuthenticatedUser();
        if (lawyer.getRole() != Role.ROLE_LAWYER) {
            throw new BadRequestException("Only lawyers can schedule hearings");
        }

        LawCase lawCase = lawCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        Hearing hearing = Hearing.builder()
                .lawCase(lawCase)
                .hearingDate(dto.getHearingDate())
                .purpose(dto.getPurpose())
                .status("SCHEDULED")
                .notes(dto.getNotes())
                .build();

        hearing = hearingRepository.save(hearing);

        // Automatically log event to case timeline
        CaseTimeline hearingEvent = CaseTimeline.builder()
                .lawCase(lawCase)
                .title("Hearing Scheduled")
                .description("New hearing scheduled on " + dto.getHearingDate() + " for: " + dto.getPurpose())
                .eventDate(dto.getHearingDate())
                .build();
        caseTimelineRepository.save(hearingEvent);

        // Notify Client
        notificationService.sendNotification(lawCase.getClient(), "A new court hearing has been scheduled for your case '" + lawCase.getTitle() + "' on " + dto.getHearingDate() + " for purpose: " + dto.getPurpose());

        return mapToHearingDTO(hearing);
    }

    @Transactional
    public HearingDTO updateHearingStatus(Long hearingId, String status, String notes) {
        User lawyer = getAuthenticatedUser();
        if (lawyer.getRole() != Role.ROLE_LAWYER) {
            throw new BadRequestException("Only lawyers can update hearing status");
        }

        Hearing hearing = hearingRepository.findById(hearingId)
                .orElseThrow(() -> new ResourceNotFoundException("Hearing not found with ID: " + hearingId));

        String oldStatus = hearing.getStatus();
        hearing.setStatus(status.toUpperCase());
        if (notes != null) {
            hearing.setNotes(notes);
        }

        hearing = hearingRepository.save(hearing);

        // Log status change to timeline
        CaseTimeline hearingChangeEvent = CaseTimeline.builder()
                .lawCase(hearing.getLawCase())
                .title("Hearing " + status)
                .description("Hearing status updated from " + oldStatus + " to " + status + ". Notes: " + notes)
                .eventDate(LocalDateTime.now())
                .build();
        caseTimelineRepository.save(hearingChangeEvent);

        // Notify Client
        notificationService.sendNotification(hearing.getLawCase().getClient(), "Court hearing scheduled on " + hearing.getHearingDate() + " for case '" + hearing.getLawCase().getTitle() + "' has been updated. Status: " + status + ". Outcome: " + notes);

        return mapToHearingDTO(hearing);
    }

    public List<HearingDTO> getHearingsForCase(Long caseId) {
        User user = getAuthenticatedUser();
        LawCase lawCase = lawCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (!lawCase.getClient().getId().equals(user.getId()) &&
                !lawCase.getLawyer().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to view these hearings");
        }

        return hearingRepository.findByLawCaseIdOrderByHearingDateAsc(caseId)
                .stream()
                .map(this::mapToHearingDTO)
                .collect(Collectors.toList());
    }

    public List<HearingDTO> getUpcomingHearings() {
        User user = getAuthenticatedUser();
        List<Hearing> hearings;
        if (user.getRole() == Role.ROLE_LAWYER) {
            hearings = hearingRepository.findByLawCaseLawyerIdAndHearingDateAfterOrderByHearingDateAsc(user.getId(), LocalDateTime.now());
        } else {
            hearings = hearingRepository.findByLawCaseClientIdAndHearingDateAfterOrderByHearingDateAsc(user.getId(), LocalDateTime.now());
        }
        return hearings.stream().map(this::mapToHearingDTO).collect(Collectors.toList());
    }

    // --- Helper Mappers ---

    private CaseDTO mapToDTO(LawCase lawCase) {
        return CaseDTO.builder()
                .id(lawCase.getId())
                .caseNumber(lawCase.getCaseNumber())
                .title(lawCase.getTitle())
                .description(lawCase.getDescription())
                .clientId(lawCase.getClient().getId())
                .clientName(lawCase.getClient().getFullName())
                .lawyerId(lawCase.getLawyer().getId())
                .lawyerName(lawCase.getLawyer().getFullName())
                .status(lawCase.getStatus().name())
                .priority(lawCase.getPriority().name())
                .courtName(lawCase.getCourtName())
                .judgeName(lawCase.getJudgeName())
                .filingDate(lawCase.getFilingDate())
                .opposingParty(lawCase.getOpposingParty())
                .opposingAdvocate(lawCase.getOpposingAdvocate())
                .createdAt(lawCase.getCreatedAt())
                .updatedAt(lawCase.getUpdatedAt())
                .build();
    }

    private CaseTimelineDTO mapToTimelineDTO(CaseTimeline event) {
        return CaseTimelineDTO.builder()
                .id(event.getId())
                .caseId(event.getLawCase().getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .createdAt(event.getCreatedAt())
                .build();
    }

    private HearingDTO mapToHearingDTO(Hearing hearing) {
        return HearingDTO.builder()
                .id(hearing.getId())
                .caseId(hearing.getLawCase().getId())
                .caseTitle(hearing.getLawCase().getTitle())
                .caseNumber(hearing.getLawCase().getCaseNumber())
                .hearingDate(hearing.getHearingDate())
                .purpose(hearing.getPurpose())
                .status(hearing.getStatus())
                .notes(hearing.getNotes())
                .createdAt(hearing.getCreatedAt())
                .updatedAt(hearing.getUpdatedAt())
                .build();
    }
}
