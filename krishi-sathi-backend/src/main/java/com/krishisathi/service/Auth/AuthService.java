
package com.krishisathi.service.Auth;

import com.krishisathi.config.RabbitMQConfig;
import com.krishisathi.dto.request.LoginRequest;
import com.krishisathi.dto.request.RegisterRequest;
import com.krishisathi.dto.request.WebLoginRequest;
import com.krishisathi.dto.request.WebSellerRegisterRequest;
import com.krishisathi.dto.response.LoginResponse;
import com.krishisathi.exception.ApiException;
import com.krishisathi.model.Role;
import com.krishisathi.model.DeliveryBoy;
import com.krishisathi.model.LoginAccess;
import com.krishisathi.model.User;
import com.krishisathi.repository.UserRepository;
import com.krishisathi.service.common.CloudinaryService;
import com.krishisathi.service.common.RabbitMessagePublisher;
import com.krishisathi.service.common.WelcomeEmailMessage;

import java.time.Instant;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.krishisathi.model.SellerProfile;
import com.krishisathi.repository.DeliveryBoyRepository;
import com.krishisathi.repository.SellerProfileRepository;

@Service
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final CloudinaryService cloudinaryService;
        public final SellerProfileRepository sellerProfileRepository;
        private final DeliveryBoyRepository deliveryBoyRepository;
        private final RabbitMessagePublisher rabbitMessagePublisher;;

        public AuthService(
                        UserRepository farmerRepository,

                        PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        CloudinaryService cloudinaryService,
                        SellerProfileRepository sellerProfileRepository,
                        DeliveryBoyRepository deliveryBoyRepository,
                        RabbitMessagePublisher rabbitMessagePublisher) {

                this.userRepository = farmerRepository;
                this.deliveryBoyRepository = deliveryBoyRepository;
                this.rabbitMessagePublisher = rabbitMessagePublisher;

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

                User user = new User();

                user.setFullName(request.getFullName().trim());
                user.setEmail(email);
                user.setMobileNumber(mobileNumber);

                user.setPassword(
                                passwordEncoder.encode(request.getPassword()));

                user.setRole(Role.FARMER);
                user.setLoginAccess(LoginAccess.APPROVED);

                userRepository.save(user);
                // 2. Publish welcome email message
                try {
                        rabbitMessagePublisher.publish(
                                        RabbitMQConfig.WELCOME_ROUTING_KEY,
                                        new WelcomeEmailMessage(
                                                        user.getEmail(),
                                                        user.getFullName()));

                } catch (Exception e) {
                        // Registration should not fail just because
                        // RabbitMQ publishing failed.
                        System.err.println(
                                        "Welcome email publishing failed: " + e.getMessage());
                }

                return "Registration successful";
        }

        public LoginResponse login(LoginRequest request) {

                Role role = request.getRole() == null ? Role.FARMER : request.getRole();

                return switch (role) {
                        case FARMER -> farmerLogin(request); // users collection, by mobile
                        case DELIVERY_BOY -> deliveryBoyLogin(request); // delivery_boy_list, by email
                        default -> throw new ApiException(
                                        "Invalid login role",
                                        HttpStatus.BAD_REQUEST);
                };
        }

        // ---------- FARMER: mobile + password ----------
        private LoginResponse farmerLogin(LoginRequest request) {

                if (request.getMobileNumber() == null
                                || request.getMobileNumber().isBlank()) {
                        throw new ApiException(
                                        "Mobile number is required",
                                        HttpStatus.BAD_REQUEST);
                }

                String mobileNumber = request.getMobileNumber().trim();

                User user = userRepository
                                .findByMobileNumber(mobileNumber)
                                .orElseThrow(() -> invalidCredentials());

                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        throw invalidCredentials();
                }

                if (user.getRole() != Role.FARMER) {
                        throw invalidCredentials();
                }

                String token = jwtService.generateToken(user.getEmail(), user.getRole());

                return new LoginResponse(token, user.getFullName(), user.getRole());
        }

        private ApiException invalidCredentials() {
                return new ApiException(
                                "Invalid email or password",
                                HttpStatus.UNAUTHORIZED);
        }

        // ---------- DELIVERY BOY: email + password ----------
        private LoginResponse deliveryBoyLogin(LoginRequest request) {

                if (request.getEmail() == null || request.getEmail().isBlank()) {
                        throw new ApiException(
                                        "Email is required",
                                        HttpStatus.BAD_REQUEST);
                }

                String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

                // delivery_boy_list stores the farmer's email in farmerEmail
                DeliveryBoy deliveryBoy = deliveryBoyRepository
                                .findByFarmerEmail(email)
                                .orElseThrow(() -> new ApiException(
                                                "Invalid email or password",
                                                HttpStatus.UNAUTHORIZED));

                if (!passwordEncoder.matches(request.getPassword(), deliveryBoy.getPassword())) {
                        throw new ApiException(
                                        "Invalid email or password",
                                        HttpStatus.UNAUTHORIZED);
                }

                String token = jwtService.generateToken(
                                deliveryBoy.getFarmerEmail(),
                                Role.DELIVERY_BOY);

                return new LoginResponse(
                                token,
                                deliveryBoy.getFullName(),
                                Role.DELIVERY_BOY);
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
                user.setLoginAccess(LoginAccess.PENDING);

                userRepository.save(user);

                // 2. Save seller-specific information in seller_profiles
                SellerProfile profile = new SellerProfile();
                profile.setUserId(email);

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

                Instant now = Instant.now();
                profile.setCreatedAt(now);
                profile.setUpdatedAt(now);

                sellerProfileRepository.save(profile);

                return "Seller registration successful. Your account is pending admin approval.";
        }

}