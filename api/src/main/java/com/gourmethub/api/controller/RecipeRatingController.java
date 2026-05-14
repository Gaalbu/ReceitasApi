package com.gourmethub.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gourmethub.api.dto.RecipeRatingRequest;
import com.gourmethub.api.model.RecipeRating;
import com.gourmethub.api.service.RecipeRatingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/recipes")
@Validated
public class RecipeRatingController {
    private final RecipeRatingService recipeRatingService;

    public RecipeRatingController(RecipeRatingService recipeRatingService) {
        this.recipeRatingService = recipeRatingService;
    }

    @PostMapping("/{recipeId}/ratings")
    public ResponseEntity<RecipeRating> addRating(@PathVariable Long recipeId,
                                                  @Valid @RequestBody RecipeRatingRequest request,
                                                  Authentication authentication) {
        return ResponseEntity.ok(recipeRatingService.addRating(recipeId, request, authentication.getName()));
    }
}

