package com.krishisathi.controller;

import com.krishisathi.dto.CursorPageResponse;
import com.krishisathi.dto.PendingSellerResponse;
import com.krishisathi.dto.SellerApprovalRequest;
import com.krishisathi.dto.SellerDetailsResponse;
import com.krishisathi.service.AdminSellerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

        private final AdminSellerService adminSellerService;

        @GetMapping("/sellers/pending")
        public ResponseEntity<CursorPageResponse<PendingSellerResponse>> getPendingSellers(
                        @RequestParam(required = false) String cursor) {

                CursorPageResponse<PendingSellerResponse> response = adminSellerService.getPendingSellers(cursor);

                return ResponseEntity.ok(response);
        }

        @PatchMapping("/sellers/{sellerId}/approval")
        public ResponseEntity<PendingSellerResponse> updateSellerApproval(
                        @PathVariable String sellerId,
                        @Valid @RequestBody SellerApprovalRequest request) {

                PendingSellerResponse response = adminSellerService.updateSellerApproval(
                                sellerId,
                                request);

                return ResponseEntity.ok(response);
        }

        @GetMapping("/sellers/{sellerId}")
        public ResponseEntity<SellerDetailsResponse> getSellerDetails(
                        @PathVariable String sellerId) {

                SellerDetailsResponse response = adminSellerService.getSellerDetails(sellerId);

                return ResponseEntity.ok(response);
        }
}