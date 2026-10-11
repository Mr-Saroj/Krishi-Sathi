package com.krishisathi.service;

import com.krishisathi.dto.RegisterRequest;
import com.krishisathi.exception.ApiException;
import com.krishisathi.model.Role;
import com.krishisathi.model.User;
import com.krishisathi.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.krishisathi.dto.LoginRequest;
import com.krishisathi.dto.LoginResponse;
import com.krishisathi.service.JwtService;

@Service

public class AuthService {
        // Used for farmer database operations
        private final UserRepository userRepository;

        // Used for password encoding
        private final PasswordEncoder passwordEncoder;

        private final JwtService jwtService;

        public AuthService(
                        UserRepository farmerRepository,
                        PasswordEncoder passwordEncoder, JwtService jwtService) {

                this.userRepository = farmerRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
        }

        public String register(RegisterRequest request) {

                // Normalize email
                String email = request.getEmail()
                                .trim()
                                .toLowerCase();

                // Normalize mobile
                String mobileNumber = request.getMobileNumber()
                                .trim();

                // Check email
                if (userRepository.existsByEmail(email)) {

                        throw new ApiException(
                                        "Email is already registered",
                                        HttpStatus.CONFLICT);
                }

                // Check mobile
                if (userRepository.existsByMobileNumber(mobileNumber)) {

                        throw new ApiException(
                                        "Mobile number is already registered",
                                        HttpStatus.CONFLICT);
                }

                // Create farmer
                User farmer = new User();

                farmer.setFullName(
                                request.getFullName().trim());

                farmer.setEmail(email);

                farmer.setMobileNumber(mobileNumber);

                // Encode password before saving
                farmer.setPassword(
                                passwordEncoder.encode(
                                                request.getPassword()));

                // Set role as FARMER
                farmer.setRole(Role.FARMER);

                // Save farmer
                userRepository.save(farmer);

                return "Registration successful";
        }

        public LoginResponse login(LoginRequest request) {

                String mobileNumber = request.getMobileNumber().trim();

                User user = userRepository
                                .findByMobileNumber(mobileNumber)
                                .orElseThrow(() -> new ApiException(
                                                "Invalid mobile number or password",
                                                HttpStatus.UNAUTHORIZED));

                boolean passwordMatches = passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword());

                if (!passwordMatches) {

                        throw new ApiException(
                                        "Invalid mobile number or password",
                                        HttpStatus.UNAUTHORIZED);
                }

                String token = jwtService.generateToken(
                                user.getEmail(),
                                user.getRole());

                return new LoginResponse(
                                token,
                                user.getFullName(),
                                user.getRole());
        }

}
