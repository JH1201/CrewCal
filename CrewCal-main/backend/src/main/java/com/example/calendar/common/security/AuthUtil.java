package com.example.calendar.common.security;

import com.example.calendar.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class AuthUtil {
    public static UserPrincipal requirePrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        Object p = auth.getPrincipal();
        if (p instanceof UserPrincipal up) return up;
        throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
    }
}
