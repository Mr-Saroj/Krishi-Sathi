
package com.krishisathi.service;

import com.krishisathi.dto.RegisterRequest;
import com.krishisathi.dto.LoginRequest;
import com.krishisathi.dto.LoginResponse;
import com.krishisathi.dto.WebLoginRequest;
import com.krishisathi.dto.WebSellerRegisterRequest;
import com.krishisathi.exception.ApiException;
import com.krishisathi.model.Role;
import com.krishisathi.model.Seller;
import com.krishisathi.model.SellerLoginAccess;
import com.krishisathi.model.User;
import com.krishisathi.repository.SellerRepository;
import com.krishisathi.repository.UserRepository;

import java.time.Instant;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

        private final UserRepository userRepository;
        private final SellerRepository sellerRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;

        public AuthService(
                        UserRepository farmerRepository,
                        SellerRepository sellerRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService) {

                this.userRepository = farmerRepository;
                this.sellerRepository = sellerRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
        }

        // Existing registration - unchanged
        public String register(RegisterRequest request) {

                String email = request.getEmail()
                                .trim()
                                .toLowerCase();

                String mobileNumber = request.getMobileNumber()
                                .trim();

                if (userRepository.existsByEmail(email)) {
                        throw new ApiException(
                                        "Email is already registered",
                                        HttpStatus.CONFLICT);
                }

                if (userRepository.existsByMobileNumber(mobileNumber)) {
                        throw new ApiException(
                                        "Mobile number is already registered",
                                        HttpStatus.CONFLICT);
                }

                User farmer = new User();

                farmer.setFullName(request.getFullName().trim());
                farmer.setEmail(email);
                farmer.setMobileNumber(mobileNumber);

                farmer.setPassword(
                                passwordEncoder.encode(request.getPassword()));

                farmer.setRole(Role.FARMER);

                userRepository.save(farmer);

                return "Registration successful";
        }

        // Existing farmer login - unchanged
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

        // New admin web login
        public LoginResponse webLogin(WebLoginRequest request) {

                String email = request.getEmail()
                                .trim()
                                .toLowerCase();

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ApiException(
                                                "Invalid email or password",
                                                HttpStatus.UNAUTHORIZED));

                if (!passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword())) {
                        throw new ApiException(
                                        "Invalid email or password",
                                        HttpStatus.UNAUTHORIZED);
                }

                if (user.getRole() != Role.ADMIN
                                && user.getRole() != Role.SELLER) {
                        throw new ApiException(
                                        "Invalid email or password",
                                        HttpStatus.UNAUTHORIZED);
                }

                // Reuse your existing JwtService
                String token = jwtService.generateToken(
                                user.getEmail(),
                                user.getRole());

                return new LoginResponse(
                                token,
                                user.getFullName(),
                                user.getRole());
        }

        // Seller registration
        public String webRegister(WebSellerRegisterRequest request) {

                String email = request.email()
                                .trim()
                                .toLowerCase(Locale.ROOT);

                String mobileNumber = request.mobileNumber().trim();

                // Check whether email already exists in sellers
                if (sellerRepository.existsByEmailIgnoreCase(email)) {
                        throw new ApiException(
                                        "Email is already registered",
                                        HttpStatus.CONFLICT);
                }

                // Check whether mobile number already exists in sellers
                if (sellerRepository.existsByMobileNumber(mobileNumber)) {
                        throw new ApiException(
                                        "Mobile number is already registered",
                                        HttpStatus.CONFLICT);
                }

                // Prevent duplicate email or mobile numbers from existing users
                if (userRepository.existsByEmail(email)) {
                        throw new ApiException(
                                        "Email is already registered",
                                        HttpStatus.CONFLICT);
                }

                if (userRepository.existsByMobileNumber(mobileNumber)) {
                        throw new ApiException(
                                        "Mobile number is already registered",
                                        HttpStatus.CONFLICT);
                }

                Seller seller = new Seller();

                // Required fields
                seller.setFullName(request.fullName().trim());
                seller.setMobileNumber(mobileNumber);
                seller.setEmail(email);
                seller.setBusinessName(request.businessName().trim());
                seller.setCity(request.city().trim());
                seller.setState(request.state().trim());
                seller.setPinCode(request.pinCode().trim());

                // Optional identity fields
                seller.setAadhaarNumber(clean(request.aadhaarNumber()));
                seller.setPanNumber(clean(request.panNumber()));
                seller.setPanDocumentUrl(clean(request.panDocumentUrl()));

                // Optional business fields
                seller.setBusinessType(clean(request.businessType()));
                seller.setBusinessAddress(clean(request.businessAddress()));
                seller.setGstin(clean(request.gstin()));
                seller.setBusinessRegistrationNumber(
                                clean(request.businessRegistrationNumber()));
                seller.setProductLicense(clean(request.productLicense()));
                seller.setSupportingDocumentsUrl(
                                clean(request.supportingDocumentsUrl()));

                // Optional bank fields
                seller.setAccountHolderName(clean(request.accountHolderName()));
                seller.setIfscCode(clean(request.ifscCode()));
                seller.setAccountNumber(clean(request.accountNumber()));
                seller.setBankProofUrl(clean(request.bankProofUrl()));

                // No password is created during registration
                seller.setPassword(null);

                // Admin approval is required before login
                seller.setLoginAccess(SellerLoginAccess.PENDING);

                // Profile completeness: all fields must be populated
                seller.setProfileIsComplete(
                                hasText(seller.getFullName())
                                                && hasText(seller.getMobileNumber())
                                                && hasText(seller.getEmail())
                                                && hasText(seller.getBusinessName())
                                                && hasText(seller.getCity())
                                                && hasText(seller.getState())
                                                && hasText(seller.getPinCode())
                                                && hasText(seller.getAadhaarNumber())
                                                && hasText(seller.getPanNumber())
                                                && hasText(seller.getPanDocumentUrl())
                                                && hasText(seller.getBusinessType())
                                                && hasText(seller.getBusinessAddress())
                                                && hasText(seller.getGstin())
                                                && hasText(seller.getBusinessRegistrationNumber())
                                                && hasText(seller.getProductLicense())
                                                && hasText(seller.getSupportingDocumentsUrl())
                                                && hasText(seller.getAccountHolderName())
                                                && hasText(seller.getIfscCode())
                                                && hasText(seller.getAccountNumber())
                                                && hasText(seller.getBankProofUrl()));

                Instant now = Instant.now();
                seller.setCreatedAt(now);
                seller.setUpdatedAt(now);

                sellerRepository.save(seller);

                return "Seller registration successful. Your account is pending admin approval.";
        }

        // Converts blank optional fields to null
        private String clean(String value) {
                return value == null || value.isBlank() ? null : value.trim();
        }

        // Checks whether a field contains a value
        private boolean hasText(String value) {
                return value != null && !value.isBlank();
        }
}
