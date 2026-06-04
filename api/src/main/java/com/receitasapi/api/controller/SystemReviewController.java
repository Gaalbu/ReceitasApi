package com.receitasapi.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.receitasapi.api.dto.SystemReviewRequest;
import com.receitasapi.api.model.SystemReview;
import com.receitasapi.api.service.SystemReviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/system-reviews")
@Validated
public class SystemReviewController {
    private final SystemReviewService systemReviewService;

    public SystemReviewController(SystemReviewService systemReviewService) {
        this.systemReviewService = systemReviewService;
    }

    @GetMapping
    public ResponseEntity<java.util.List<SystemReview>> listReviews(Authentication authentication) {
        return ResponseEntity.ok(systemReviewService.listMyReviews(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SystemReview> getReview(@PathVariable Long id) {
        return ResponseEntity.ok(systemReviewService.getReview(id));
    }

    @PostMapping
    public ResponseEntity<SystemReview> createReview(@Valid @RequestBody SystemReviewRequest request,
                                                      Authentication authentication) {
        return ResponseEntity.ok(systemReviewService.createReview(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SystemReview> updateReview(@PathVariable Long id,
                                                     @Valid @RequestBody SystemReviewRequest request,
                                                     Authentication authentication) {
        return ResponseEntity.ok(systemReviewService.updateReview(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        systemReviewService.deleteReview(id, authentication.getName(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}

