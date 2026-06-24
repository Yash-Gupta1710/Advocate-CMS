package com.advocate.management.service;

import com.advocate.management.dto.DocumentDTO;
import com.advocate.management.entity.LawCase;
import com.advocate.management.entity.UploadedFile;
import com.advocate.management.entity.User;
import com.advocate.management.enums.Role;
import com.advocate.management.exception.BadRequestException;
import com.advocate.management.exception.ResourceNotFoundException;
import com.advocate.management.repository.LawCaseRepository;
import com.advocate.management.repository.UploadedFileRepository;
import com.advocate.management.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final UploadedFileRepository uploadedFileRepository;
    private final UserRepository userRepository;
    private final LawCaseRepository lawCaseRepository;
    private final NotificationService notificationService;

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private User getLawyer() {
        return userRepository.findByRole(Role.ROLE_LAWYER).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer user not found"));
    }

    @Transactional
    public DocumentDTO uploadDocument(MultipartFile file, String category, Long caseId) {
        User user = getAuthenticatedUser();

        // 1. Validate File type (PDF, DOCX, JPG, PNG)
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        List<String> allowedExtensions = Arrays.asList("pdf", "docx", "jpg", "jpeg", "png");
        if (!allowedExtensions.contains(extension)) {
            throw new BadRequestException("Only PDF, DOCX, JPG, JPEG, and PNG files are allowed");
        }

        // 2. Resolve target case if provided
        LawCase lawCase = null;
        if (caseId != null) {
            lawCase = lawCaseRepository.findById(caseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));
            // Verify access to case
            if (user.getRole() == Role.ROLE_CLIENT && !lawCase.getClient().getId().equals(user.getId())) {
                throw new BadRequestException("You are not authorized to upload files for this case");
            }
        }

        // 3. Generate unique filename to prevent overwrite
        String uniqueFilename = UUID.randomUUID() + "_" + originalFilename;
        Path targetLocation = this.fileStorageLocation.resolve(uniqueFilename);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }

        UploadedFile uploadedFile = UploadedFile.builder()
                .filename(uniqueFilename)
                .originalFilename(originalFilename)
                .contentType(file.getContentType())
                .size(file.getSize())
                .filePath(targetLocation.toString())
                .category(category != null ? category.toUpperCase() : "OTHER")
                .owner(user)
                .lawCase(lawCase)
                .build();

        uploadedFile = uploadedFileRepository.save(uploadedFile);

        // 4. Send Notifications
        if (user.getRole() == Role.ROLE_CLIENT) {
            // Client uploaded -> Notify lawyer
            User lawyer = getLawyer();
            notificationService.sendNotification(lawyer, "New document uploaded by client " + user.getFullName() + ": " + originalFilename + " (" + category + ")");
        } else {
            // Lawyer uploaded -> Notify client if linked to a case
            if (lawCase != null) {
                notificationService.sendNotification(lawCase.getClient(), "A new document has been added to your case '" + lawCase.getTitle() + "': " + originalFilename);
            }
        }

        return mapToDTO(uploadedFile);
    }

    public Resource downloadDocument(Long id) {
        User user = getAuthenticatedUser();
        UploadedFile file = uploadedFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + id));

        // Enforce access control
        // Clients can only download files they uploaded, or case-specific files if they are the client of the case
        if (user.getRole() == Role.ROLE_CLIENT) {
            boolean isOwner = file.getOwner().getId().equals(user.getId());
            boolean isCaseClient = file.getLawCase() != null && file.getLawCase().getClient().getId().equals(user.getId());
            if (!isOwner && !isCaseClient) {
                throw new BadRequestException("You are not authorized to download this file");
            }
        }

        try {
            Path filePath = this.fileStorageLocation.resolve(file.getFilename()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on disk: " + file.getOriginalFilename());
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found on disk: " + file.getOriginalFilename(), ex);
        }
    }

    @Transactional
    public void deleteDocument(Long id) {
        User user = getAuthenticatedUser();
        UploadedFile file = uploadedFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + id));

        // Security check
        if (user.getRole() == Role.ROLE_CLIENT && !file.getOwner().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to delete this file");
        }

        // Delete from database
        uploadedFileRepository.delete(file);

        // Delete from disk
        try {
            Path filePath = this.fileStorageLocation.resolve(file.getFilename()).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log warning but don't break transaction since DB record is cleared
            System.err.println("Warning: Failed to delete physical file: " + file.getFilePath());
        }
    }

    public List<DocumentDTO> getMyDocuments() {
        User user = getAuthenticatedUser();
        List<UploadedFile> files;

        if (user.getRole() == Role.ROLE_LAWYER) {
            files = uploadedFileRepository.findAll();
        } else {
            files = uploadedFileRepository.findByOwnerId(user.getId());
        }

        return files.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<DocumentDTO> getCaseDocuments(Long caseId) {
        User user = getAuthenticatedUser();
        LawCase lawCase = lawCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (user.getRole() == Role.ROLE_CLIENT && !lawCase.getClient().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to view documents for this case");
        }

        return uploadedFileRepository.findByLawCaseId(caseId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private DocumentDTO mapToDTO(UploadedFile file) {
        return DocumentDTO.builder()
                .id(file.getId())
                .filename(file.getFilename())
                .originalFilename(file.getOriginalFilename())
                .contentType(file.getContentType())
                .size(file.getSize())
                .category(file.getCategory())
                .ownerId(file.getOwner().getId())
                .ownerName(file.getOwner().getFullName())
                .caseId(file.getLawCase() != null ? file.getLawCase().getId() : null)
                .caseTitle(file.getLawCase() != null ? file.getLawCase().getTitle() : null)
                .uploadedAt(file.getUploadedAt())
                .build();
    }
}
