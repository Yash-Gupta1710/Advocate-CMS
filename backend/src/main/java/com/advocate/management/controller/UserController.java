package com.advocate.management.controller;

import com.advocate.management.dto.UserDto;
import com.advocate.management.entity.User;
import com.advocate.management.enums.Role;
import com.advocate.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/clients")
    @PreAuthorize("hasAuthority('ROLE_LAWYER')")
    public ResponseEntity<List<UserDto>> getClients() {
        List<User> clients = userRepository.findByRole(Role.ROLE_CLIENT);
        List<UserDto> dtos = clients.stream().map(client -> UserDto.builder()
                .id(client.getId().toString())
                .name(client.getFullName())
                .email(client.getEmail())
                .role("client")
                .phoneNumber(client.getPhoneNumber())
                .build()
        ).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
