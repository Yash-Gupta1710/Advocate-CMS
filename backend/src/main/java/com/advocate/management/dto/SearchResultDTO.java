package com.advocate.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDTO {
    private List<CaseDTO> cases;
    private List<DocumentDTO> documents;
    private List<UserDto> clients;
}
