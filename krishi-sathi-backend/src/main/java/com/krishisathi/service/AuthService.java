
package com.krishisathi.service;

import com.krishisathi.dto.RegisterRequest;
import com.krishisathi.dto.LoginRequest;
import com.krishisathi.dto.LoginResponse;
import com.krishisathi.dto.WebLoginRequest;
import com.krishisathi.dto.WebSellerRegisterRequest;
import com.krishisathi.exception.ApiException;
import com.krishisathi.model.Role;

import com.krishisathi.model.SellerLoginAccess;
import com.krishisathi.model.User;
import com.krishisathi.repository.UserRepository;

import java.time.Instant;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.krishisathi.model.SellerProfile;
import com.krishisathi.repository.SellerProfileRepository;

@Service
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final CloudinaryService cloudinaryService;
        public final SellerProfileRepository sellerProfileRepository;

        public AuthService(
                        UserRepository farmerRepository,
                        
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        CloudinaryService cloudinaryService,
                        SellerProfileRepository sellerProfileRepository) {

                this.userRepository = farmerRepository;
                
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
                this.cloudinaryService = cloudinaryService;
                this.sellerProfileRepository = sellerProfileRepository;
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

        // farmer login
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

        public String webRegister(WebSellerRegisterRequest request) {

                String email = request.email().trim().toLowerCase(Locale.ROOT);
                String mobileNumber = request.mobileNumber().trim();

                if (userRepository.existsByEmail(email)
                                || userRepository.existsByEmailIgnoreCase(email)) {
                        throw new ApiException(
                                        "Email is already registered",
                                        HttpStatus.CONFLICT);
                }

                if (userRepository.existsByMobileNumber(mobileNumber)
                                || userRepository.existsByMobileNumber(mobileNumber)) {
                        throw new ApiException(
                                        "Mobile number is already registered",
                                        HttpStatus.CONFLICT);
                }

                // Upload documents
                String panDocumentUrl = cloudinaryService.uploadPrivateImage(
                                request.panDocument(), "seller/pan");

                String bankProofUrl = cloudinaryService.uploadPrivateImage(
                                request.bankProof(), "seller/bank-proof");

                String supportingDocumentsUrl = cloudinaryService.uploadPrivateImage(
                                request.supportingDocuments(),
                                "seller/supporting-documents");

                // 1. Save common account information in users
                User user = new User();
                user.setFullName(request.fullName().trim());
                user.setEmail(email);
                user.setMobileNumber(mobileNumber);
                user.setPassword(passwordEncoder.encode(request.password()));
                user.setRole(Role.SELLER);

                userRepository.save(user);

                // 2. Save seller-specific information in seller_profiles
                SellerProfile profile = new SellerProfile();
                profile.setUserId(user.getId());

                profile.setBusinessName(request.businessName().trim());
                profile.setCity(request.city().trim());
                profile.setState(request.state().trim());
                profile.setPinCode(request.pinCode().trim());
                profile.setBusinessType(request.businessType().trim());
                profile.setBusinessAddress(request.businessAddress().trim());
                profile.setGstin(request.gstin().trim());
                profile.setBusinessRegistrationNumber(
                                request.businessRegistrationNumber().trim());
                profile.setProductLicense(request.productLicense().trim());

                profile.setAadhaarNumber(request.aadhaarNumber().trim());
                profile.setPanNumber(request.panNumber().trim());
                profile.setPanDocumentUrl(panDocumentUrl);
                profile.setSupportingDocumentsUrl(supportingDocumentsUrl);

                profile.setAccountHolderName(request.accountHolderName().trim());
                profile.setIfscCode(request.ifscCode().trim());
                profile.setAccountNumber(request.accountNumber().trim());
                profile.setBankProofUrl(bankProofUrl);

                profile.setLoginAccess(SellerLoginAccess.PENDING);

                Instant now = Instant.now();
                profile.setCreatedAt(now);
                profile.setUpdatedAt(now);

                sellerProfileRepository.save(profile);

                return "Seller registration successful. Your account is pending admin approval.";
        }

}