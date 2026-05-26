package com.receitasapi.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
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

    @PostMapping
    public ResponseEntity<SystemReview> createReview(@Valid @RequestBody SystemReviewRequest request,
                                                     Authentication authentication) {
        return ResponseEntity.ok(systemReviewService.createReview(request, authentication.getName()));
    }
}

