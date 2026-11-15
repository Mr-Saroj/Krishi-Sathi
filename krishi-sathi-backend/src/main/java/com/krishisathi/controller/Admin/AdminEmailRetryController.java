package com.krishisathi.controller.Admin;

import com.krishisathi.service.Admin.FailedEmailRetryService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/emails")
public class AdminEmailRetryController {

    private final FailedEmailRetryService retryService;

    public AdminEmailRetryController(
            FailedEmailRetryService retryService) {
        this.retryService = retryService;
    }

    @PostMapping("/retry-failed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> retryFailedEmails(
            @RequestParam(defaultValue = "10") int limit) {

        int retriedCount = retryService.retryFailedEmails(limit);

        return ResponseEntity.ok(
                Map.of(
                        "message", "Failed email retry completed",
                        "retriedCount", retriedCount
                )
        );
    }
}
