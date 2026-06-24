package com.advocate.management.repository;

import com.advocate.management.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long>, JpaSpecificationExecutor<UploadedFile> {

    Optional<UploadedFile> findByFilename(String filename);

    List<UploadedFile> findByOwnerId(Long ownerId);

    List<UploadedFile> findByLawCaseId(Long caseId);
}
