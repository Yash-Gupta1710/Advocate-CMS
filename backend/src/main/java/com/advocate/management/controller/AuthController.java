package com.advocate.management.controller;

import com.advocate.management.dto.*;
import com.advocate.management.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/security-question")
    public ResponseEntity<Map<String, String>> getSecurityQuestion(@RequestParam String email) {
        String question = authService.getSecurityQuestion(email);
        return ResponseEntity.ok(Map.of("securityQuestion", question));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String message = authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String message = authService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
