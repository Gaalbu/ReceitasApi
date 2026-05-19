package com.gourmethub.api.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.gourmethub.api.dto.RecipeRatingRequest;
import com.gourmethub.api.model.Recipe;
import com.gourmethub.api.model.RecipeRating;
import com.gourmethub.api.model.User;
import com.gourmethub.api.repository.RecipeRatingRepository;
import com.gourmethub.api.repository.RecipeRepository;
import com.gourmethub.api.repository.UserRepository;

@Service
public class RecipeRatingService {
    private final RecipeRatingRepository recipeRatingRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    public RecipeRatingService(RecipeRatingRepository recipeRatingRepository, RecipeRepository recipeRepository,
                               UserRepository userRepository) {
        this.recipeRatingRepository = recipeRatingRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
    }

    public RecipeRating addRating(Long recipeId, RecipeRatingRequest request, String username) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receita nao encontrada"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        RecipeRating rating = RecipeRating.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .recipe(recipe)
                .user(user)
                .build();

        return recipeRatingRepository.save(rating);
    }
}

