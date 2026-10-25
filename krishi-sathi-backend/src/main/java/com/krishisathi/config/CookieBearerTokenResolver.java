package com.krishisathi.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.stereotype.Component;

@Component
public class CookieBearerTokenResolver
        implements BearerTokenResolver {

    private final DefaultBearerTokenResolver headerResolver =
            new DefaultBearerTokenResolver();

    @Override
    public String resolve(HttpServletRequest request) {

        // Keep supporting existing Authorization: Bearer requests
        String headerToken = headerResolver.resolve(request);

        if (headerToken != null) {
            return headerToken;
        }

        // Also accept JWT from the web login cookie
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    String token = cookie.getValue();

                    if (token != null && !token.isBlank()) {
                        return token;
                    }
                }
            }
        }

        return null;
    }
}