package com.example.calendar.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record SignupRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String displayName
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record AuthResponse(
            String token,
            String email,
            long userId
    ) {}

    public record MeResponse(
            long userId,
            String email,
            String displayName
    ) {}
}
