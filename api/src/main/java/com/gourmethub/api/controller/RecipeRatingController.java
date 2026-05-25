package com.gourmethub.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gourmethub.api.dto.MyRecipeReviewResponse;
import com.gourmethub.api.dto.RecipeRatingRequest;
import com.gourmethub.api.model.RecipeRating;
import com.gourmethub.api.service.RecipeRatingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/recipes")
@Validated
public class RecipeRatingController {
    private final RecipeRatingService recipeRatingService;
    private static final Logger logger = LoggerFactory.getLogger(RecipeRatingController.class);

    public RecipeRatingController(RecipeRatingService recipeRatingService) {
        this.recipeRatingService = recipeRatingService;
    }

    @PostMapping("/{recipeId}/ratings")
    public ResponseEntity<RecipeRating> addRating(@PathVariable Long recipeId,
                                                  @Valid @RequestBody RecipeRatingRequest request,
                                                  Authentication authentication) {
        String principal = authentication == null ? "<null>" : authentication.getName();
        logger.debug("POST /recipes/{}/ratings called by principal={} request={}", recipeId, principal, request);
        RecipeRating saved = recipeRatingService.addRating(recipeId, request, principal);
        logger.debug("Rating saved id={} for recipeId={} by {}", saved.getId(), recipeId, principal);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/ratings/me")
    public ResponseEntity<List<MyRecipeReviewResponse>> myRatings(Authentication authentication) {
        String principal = authentication == null ? "<null>" : authentication.getName();
        logger.debug("GET /recipes/ratings/me called by principal={}", principal);
        return ResponseEntity.ok(recipeRatingService.listMyRatings(principal));
    }
}

