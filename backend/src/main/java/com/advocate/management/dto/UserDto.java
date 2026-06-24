package com.advocate.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String name;
    private String email;
    private String role; // "lawyer" or "client"
    private String phoneNumber;
    private String specialization;
    private String barcodeNumber;
}
