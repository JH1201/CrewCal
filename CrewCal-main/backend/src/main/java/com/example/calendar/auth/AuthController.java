package com.example.calendar.auth;

import com.example.calendar.auth.AuthDtos.*;
import com.example.calendar.common.exception.ApiException;
import com.example.calendar.common.security.AuthUtil;
import com.example.calendar.common.security.JwtService;
import com.example.calendar.common.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        }
        String hash = encoder.encode(req.password());
        userRepository.createEmailUser(req.email(), hash, req.displayName());
        long userId = userRepository.findIdByEmail(req.email());
        String token = jwtService.issue(userId, req.email());
        return new AuthResponse(token, req.email(), userId);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        if (!userRepository.existsByEmail(req.email())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        // 전환 정책: 이미 GOOGLE로 전환된 이메일은 이메일 로그인 불가
        String provider = userRepository.findProvider(req.email());
        if ("GOOGLE".equalsIgnoreCase(provider)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "This account uses Google login. Please sign in with Google.");
        }

        String hash = userRepository.findPasswordHash(req.email());
        if (hash == null) {
            // password_hash가 null이면 전환(또는 비번 로그인 비활성화) 상태이므로 이메일 로그인 불가
            throw new ApiException(HttpStatus.UNAUTHORIZED, "This account uses Google login. Please sign in with Google.");
        }

        if (!encoder.matches(req.password(), hash)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        long userId = userRepository.findIdByEmail(req.email());
        String token = jwtService.issue(userId, req.email());
        return new AuthResponse(token, req.email(), userId);
    }

    @GetMapping("/me")
    public MeResponse me() {
        UserPrincipal p = AuthUtil.requirePrincipal();
        String name = userRepository.findDisplayName(p.email());
        return new MeResponse(p.userId(), p.email(), name);
    }
}
