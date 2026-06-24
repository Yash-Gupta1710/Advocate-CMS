package com.advocate.management.controller;

import com.advocate.management.dto.*;
import com.advocate.management.entity.*;
import com.advocate.management.enums.Role;
import com.advocate.management.exception.ResourceNotFoundException;
import com.advocate.management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final LawCaseRepository lawCaseRepository;
    private final UploadedFileRepository uploadedFileRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<SearchResultDTO> search(@RequestParam("q") String query) {
        User user = getAuthenticatedUser();
        String q = query.toLowerCase();

        List<CaseDTO> matchedCases = new ArrayList<>();
        List<DocumentDTO> matchedDocs = new ArrayList<>();
        List<UserDto> matchedClients = new ArrayList<>();

        boolean isLawyer = user.getRole() == Role.ROLE_LAWYER;

        // 1. Search Cases
        List<LawCase> cases;
        if (isLawyer) {
            cases = lawCaseRepository.findByLawyerId(user.getId());
        } else {
            cases = lawCaseRepository.findByClientId(user.getId());
        }

        matchedCases = cases.stream()
                .filter(c -> c.getTitle().toLowerCase().contains(q)
                        || c.getCaseNumber().toLowerCase().contains(q)
                        || (c.getDescription() != null && c.getDescription().toLowerCase().contains(q))
                        || c.getCourtName().toLowerCase().contains(q)
                        || (c.getClient().getFullName().toLowerCase().contains(q)))
                .map(c -> CaseDTO.builder()
                        .id(c.getId())
                        .caseNumber(c.getCaseNumber())
                        .title(c.getTitle())
                        .description(c.getDescription())
                        .clientId(c.getClient().getId())
                        .clientName(c.getClient().getFullName())
                        .lawyerId(c.getLawyer().getId())
                        .lawyerName(c.getLawyer().getFullName())
                        .status(c.getStatus().name())
                        .priority(c.getPriority().name())
                        .courtName(c.getCourtName())
                        .filingDate(c.getFilingDate())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // 2. Search Documents
        List<UploadedFile> files;
        if (isLawyer) {
            files = uploadedFileRepository.findAll();
        } else {
            files = uploadedFileRepository.findByOwnerId(user.getId());
        }

        matchedDocs = files.stream()
                .filter(f -> f.getOriginalFilename().toLowerCase().contains(q)
                        || f.getCategory().toLowerCase().contains(q))
                .map(f -> DocumentDTO.builder()
                        .id(f.getId())
                        .filename(f.getFilename())
                        .originalFilename(f.getOriginalFilename())
                        .contentType(f.getContentType())
                        .size(f.getSize())
                        .category(f.getCategory())
                        .ownerId(f.getOwner().getId())
                        .ownerName(f.getOwner().getFullName())
                        .caseId(f.getLawCase() != null ? f.getLawCase().getId() : null)
                        .caseTitle(f.getLawCase() != null ? f.getLawCase().getTitle() : null)
                        .uploadedAt(f.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        // 3. Search Clients (Lawyer Role Only)
        if (isLawyer) {
            List<User> clients = userRepository.findByRole(Role.ROLE_CLIENT);
            matchedClients = clients.stream()
                    .filter(c -> c.getFullName().toLowerCase().contains(q)
                            || c.getEmail().toLowerCase().contains(q)
                            || c.getPhoneNumber().toLowerCase().contains(q))
                    .map(c -> UserDto.builder()
                            .id(c.getId().toString())
                            .name(c.getFullName())
                            .email(c.getEmail())
                            .role("client")
                            .phoneNumber(c.getPhoneNumber())
                            .build())
                    .collect(Collectors.toList());
        }

        SearchResultDTO results = SearchResultDTO.builder()
                .cases(matchedCases)
                .documents(matchedDocs)
                .clients(matchedClients)
                .build();

        return ResponseEntity.ok(results);
    }
}
