package com.krishisathi.controller;

import com.krishisathi.dto.RegisterRequest;
import com.krishisathi.service.AuthService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import com.krishisathi.dto.ApiResponse;
import com.krishisathi.dto.LoginRequest;
import com.krishisathi.dto.LoginResponse;
import com.krishisathi.dto.WebLoginRequest;
import com.krishisathi.dto.WebSellerRegisterRequest;
import com.krishisathi.model.User;
import com.krishisathi.repository.UserRepository;

import java.time.Duration;

import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        private final AuthService authService;
        private final long jwtExpiration;
        private final boolean secureCookie;
        private final UserRepository userRepository;

        public AuthController(
                        AuthService authService,
                        UserRepository userRepository,
                        @Value("${jwt.expiration}") long jwtExpiration,
                        @Value("${app.cookie.secure:true}") boolean secureCookie) {

                this.authService = authService;
                this.userRepository = userRepository;
                this.jwtExpiration = jwtExpiration;
                this.secureCookie = secureCookie;
        }

        // Existing registration - unchanged
        @PostMapping("/register")
        public ResponseEntity<ApiResponse> register(
                        @Valid @RequestBody RegisterRequest request) {

                String message = authService.register(request);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(new ApiResponse(message));
        }

        // Existing farmer login - unchanged
        @PostMapping("/login")
        public ResponseEntity<LoginResponse> login(
                        @Valid @RequestBody LoginRequest request) {

                LoginResponse response = authService.login(request);

                return ResponseEntity.ok(response);
        }

        // New admin web login
        @PostMapping("/weblogin")
        public ResponseEntity<LoginResponse> webLogin(
                        @Valid @RequestBody WebLoginRequest request,
                        HttpServletResponse response) {

                LoginResponse loginResponse = authService.webLogin(request);

                // Create HttpOnly JWT cookie
                ResponseCookie cookie = ResponseCookie
                                // Creates a cookie named accessToken and puts the JWT in it.
                                .from("accessToken", loginResponse.getToken())
                                // Prevents JavaScript from reading the cookie through document.cookie.
                                .httpOnly(true)
                                // If true, the browser sends the cookie only over HTTPS.
                                .secure(secureCookie)
                                // Restricts many cross-site requests from sending the cookie.
                                .sameSite("Lax")
                                // /Makes the cookie available across the website's URL paths.
                                .path("/")
                                // Sets how long the browser should keep the cookie, in this case using
                                // milliseconds.
                                .maxAge(Duration.ofMillis(jwtExpiration))
                                // Builds the final cookie object.
                                .build();

                response.addHeader(
                                HttpHeaders.SET_COOKIE,
                                cookie.toString());

                return ResponseEntity.ok(loginResponse);
        }

        @GetMapping("/me")
        public ResponseEntity<?> currentUser() {

                // 1. Get authenticated user from Spring Security
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                if (authentication == null
                                || !authentication.isAuthenticated()
                                || "anonymousUser".equals(authentication.getPrincipal())) {

                        return ResponseEntity
                                        .status(HttpStatus.UNAUTHORIZED)
                                        .build();
                }

                String role = authentication.getAuthorities()
                                .stream()
                                .map(authority -> authority.getAuthority())
                                .filter(authority -> authority.equals("ADMIN")
                                                || authority.equals("SELLER"))
                                .findFirst()
                                .orElse(null);

                // 3. Allow only ADMIN and SELLER
                if (role == null) {
                        return ResponseEntity
                                        .status(HttpStatus.FORBIDDEN)
                                        .build();
                }

                // 4. Get email from authenticated principal
                String email = authentication.getName();

                // 5. Find actual user in database
                var optionalUser = userRepository.findByEmail(email);

                if (optionalUser.isEmpty()) {
                        return ResponseEntity
                                        .status(HttpStatus.UNAUTHORIZED)
                                        .build();
                }

                User user = optionalUser.get();

                // 6. Verify current database role matches authenticated role
                String databaseRole = user.getRole().toString();

                if (!role.equalsIgnoreCase(databaseRole)) {
                        return ResponseEntity
                                        .status(HttpStatus.FORBIDDEN)
                                        .build();
                }

                // 7. Return actual full name and role
                return ResponseEntity.ok(Map.of(
                                "fullName", user.getFullName(),
                                "role", databaseRole.toUpperCase()));
        }

        @PostMapping("/logout")
        public ResponseEntity<ApiResponse> logout(
                        HttpServletResponse response) {

                ResponseCookie cookie = ResponseCookie
                                .from("accessToken", "")
                                .httpOnly(true)
                                .secure(secureCookie)
                                .sameSite("Lax")
                                .path("/")
                                .maxAge(0)
                                .build();

                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                return ResponseEntity.ok(
                                new ApiResponse("Logged out successfully"));
        }

        @PostMapping("/webRegister")
        public ResponseEntity<ApiResponse> webRegister(
                        @Valid @RequestBody WebSellerRegisterRequest request) {

                String message = authService.webRegister(request);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(new ApiResponse(message));
        }

}
