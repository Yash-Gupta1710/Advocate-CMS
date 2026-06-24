package com.advocate.management.controller;

import com.advocate.management.dto.DocumentDTO;
import com.advocate.management.entity.UploadedFile;
import com.advocate.management.repository.UploadedFileRepository;
import com.advocate.management.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final UploadedFileRepository uploadedFileRepository;

    @PostMapping("/upload")
    public ResponseEntity<DocumentDTO> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "caseId", required = false) Long caseId
    ) {
        DocumentDTO uploaded = documentService.uploadDocument(file, category, caseId);
        return ResponseEntity.ok(uploaded);
    }

    @GetMapping
    public ResponseEntity<List<DocumentDTO>> getMyDocuments() {
        return ResponseEntity.ok(documentService.getMyDocuments());
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<DocumentDTO>> getCaseDocuments(@PathVariable Long caseId) {
        return ResponseEntity.ok(documentService.getCaseDocuments(caseId));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        Resource fileResource = documentService.downloadDocument(id);
        
        // Find filename and content type from database
        UploadedFile metadata = uploadedFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File metadata not found"));
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalFilename() + "\"")
                .body(fileResource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Document deleted successfully"));
    }
}
