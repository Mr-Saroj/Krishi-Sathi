package com.krishisathi.service;

import com.krishisathi.dto.RegisterRequest;
import com.krishisathi.exception.ApiException;
import com.krishisathi.model.User;
import com.krishisathi.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service

public class AuthService {
    // Used for farmer database operations
    private final UserRepository userRepository;

    // Used for password encoding
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository farmerRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = farmerRepository;
        this.passwordEncoder = passwordEncoder;
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

        // Save farmer
        userRepository.save(farmer);

        return "Registration successful";
    }

}
