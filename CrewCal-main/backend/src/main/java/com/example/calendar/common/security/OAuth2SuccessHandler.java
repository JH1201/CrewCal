package com.example.calendar.common.security;

import com.example.calendar.auth.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final String frontendBaseUrl;

    public OAuth2SuccessHandler(UserRepository userRepository, JwtService jwtService,
                                @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        OAuth2User user = token.getPrincipal();

        String email = user.getAttribute("email");
        String name = user.getAttribute("name");
        String sub = user.getAttribute("sub");

        long userId = userRepository.upsertGoogleUser(email, name != null ? name : email, sub);
        String jwt = jwtService.issue(userId, email);

        String redirect = UriComponentsBuilder.fromUriString(frontendBaseUrl)
                .path("/oauth2/callback")
                .queryParam("token", jwt)
                .build().toUriString();

        response.sendRedirect(redirect);
    }
}
