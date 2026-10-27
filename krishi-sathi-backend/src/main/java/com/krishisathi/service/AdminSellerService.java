package com.krishisathi.service;

import com.krishisathi.dto.CursorPageResponse;
import com.krishisathi.dto.PendingSellerResponse;
import com.krishisathi.dto.SellerApprovalRequest;
import com.krishisathi.dto.SellerDetailsResponse;
import com.krishisathi.model.LoginAccess;
import com.krishisathi.model.Role;
import com.krishisathi.model.SellerProfile;
import com.krishisathi.model.User;
import com.krishisathi.repository.AdminRepository;
import com.krishisathi.repository.SellerProfileRepository;

import lombok.RequiredArgsConstructor;

import org.bson.types.ObjectId;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class AdminSellerService {

        private final AdminRepository adminRepository;
        private final SellerProfileRepository sellerProfileRepository;

        private static final int PAGE_SIZE = 15;

        public CursorPageResponse<PendingSellerResponse> getPendingSellers(
                        String cursor) {

                Pageable pageable = PageRequest.of(
                                0,
                                PAGE_SIZE + 1,
                                Sort.by(Sort.Direction.DESC, "id"));

                List<User> users;

                if (cursor == null || cursor.isBlank()) {

                        // First request: find pending sellers
                        users = adminRepository.findByRoleAndLoginAccess(
                                        Role.SELLER,
                                        LoginAccess.PENDING,
                                        pageable);

                } else {

                        // Validate the MongoDB ObjectId cursor
                        if (!ObjectId.isValid(cursor)) {
                                throw new IllegalArgumentException(
                                                "Invalid pagination cursor");
                        }

                        // Next request: continue after the previous cursor
                        users = adminRepository
                                        .findByRoleAndLoginAccessAndIdLessThan(
                                                        Role.SELLER,
                                                        LoginAccess.PENDING,
                                                        cursor,
                                                        pageable);
                }

                // Fetch 16 records to determine whether another page exists
                boolean hasNext = users.size() > PAGE_SIZE;

                // Return only 15 sellers
                if (hasNext) {
                        users = users.subList(0, PAGE_SIZE);
                }

                // Convert User entities into safe response DTOs
                List<PendingSellerResponse> content = users.stream()
                                .map(user -> new PendingSellerResponse(
                                                user.getId(),
                                                user.getFullName(),
                                                user.getEmail(),
                                                user.getMobileNumber(),
                                                user.getLoginAccess() == null
                                                                ? null
                                                                : user.getLoginAccess().name()))
                                .toList();

                // Use the last returned seller's ID as the next cursor
                String nextCursor = hasNext && !users.isEmpty()
                                ? users.get(users.size() - 1).getId()
                                : null;

                return new CursorPageResponse<>(
                                content,
                                nextCursor,
                                hasNext);
        }

        public PendingSellerResponse updateSellerApproval(
                        String sellerId,
                        SellerApprovalRequest request) {

                // Validate the seller ID
                if (!ObjectId.isValid(sellerId)) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Invalid seller ID");
                }

                // Only APPROVED or REJECTED decisions are allowed
                LoginAccess decision = request.loginAccess();

                if (decision != LoginAccess.APPROVED
                                && decision != LoginAccess.REJECTED) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Approval status must be APPROVED or REJECTED");
                }

                // Find the seller in the users collection
                User seller = adminRepository.findById(sellerId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Seller not found"));

                // Ensure this user is actually a seller
                if (seller.getRole() != Role.SELLER) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "The requested user is not a seller");
                }

                // Only pending sellers can be approved or rejected
                if (seller.getLoginAccess() != LoginAccess.PENDING) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Seller is no longer pending approval");
                }

                // Update the seller's login access
                seller.setLoginAccess(decision);

                // Persist the updated seller
                User updatedSeller = adminRepository.save(seller);

                // Return a safe response without the password
                return new PendingSellerResponse(
                                updatedSeller.getId(),
                                updatedSeller.getFullName(),
                                updatedSeller.getEmail(),
                                updatedSeller.getMobileNumber(),
                                updatedSeller.getLoginAccess().name());
        }

        public SellerDetailsResponse getSellerDetails(String sellerId) {

                // Validate the seller ID
                if (!ObjectId.isValid(sellerId)) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Invalid seller ID");
                }

                // Find the seller's account in the users collection
                User seller = adminRepository.findById(sellerId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Seller not found"));

                // Ensure the requested account belongs to a seller
                if (seller.getRole() != Role.SELLER) {
                        throw new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Seller not found");
                }

                // Find the seller's business profile
                SellerProfile profile = sellerProfileRepository.findByUserId(seller.getEmail())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Seller profile not found"));

                // Return account information and complete business profile
                return new SellerDetailsResponse(
                                seller.getId(),
                                seller.getFullName(),
                                seller.getEmail(),
                                seller.getMobileNumber(),
                                seller.getRole().name(),
                                seller.getLoginAccess() == null
                                                ? null
                                                : seller.getLoginAccess().name(),
                                profile);
        }
}