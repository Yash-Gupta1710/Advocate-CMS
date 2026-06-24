package com.advocate.management.service;

import com.advocate.management.config.JwtService;
import com.advocate.management.dto.*;
import com.advocate.management.entity.User;
import com.advocate.management.enums.Role;
import com.advocate.management.exception.BadRequestException;
import com.advocate.management.exception.ResourceNotFoundException;
import com.advocate.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Role userRole = "lawyer".equalsIgnoreCase(request.getRole()) ? Role.ROLE_LAWYER : Role.ROLE_CLIENT;

        String displayName = request.getFullName() != null && !request.getFullName().trim().isEmpty()
                ? request.getFullName()
                : request.getName();
        if (displayName == null || displayName.trim().isEmpty()) {
            throw new BadRequestException("Full name is required");
        }

        User user = User.builder()
                .fullName(displayName)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .phoneNumber(request.getPhoneNumber())
                .securityQuestion(request.getSecurityQuestion())
                .securityAnswer(request.getSecurityAnswer())
                .build();

        userRepository.save(user);
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(mapToUserDto(user))
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(mapToUserDto(user))
                .build();
    }

    public String getSecurityQuestion(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + email));
        return user.getSecurityQuestion();
    }

    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getSecurityAnswer().equalsIgnoreCase(request.getSecurityAnswer().trim())) {
            throw new BadRequestException("Incorrect answer to the security question");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Password has been reset successfully";
    }

    public String changePassword(ChangePasswordRequest request) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Password changed successfully";
    }

    public UserDto mapToUserDto(User user) {
        String roleStr = user.getRole() == Role.ROLE_LAWYER ? "lawyer" : "client";
        return UserDto.builder()
                .id(user.getId().toString())
                .name(user.getFullName())
                .email(user.getEmail())
                .role(roleStr)
                .phoneNumber(user.getPhoneNumber())
                .specialization(user.getSpecialization())
                .barcodeNumber(user.getBarcodeNumber())
                .build();
    }
}
