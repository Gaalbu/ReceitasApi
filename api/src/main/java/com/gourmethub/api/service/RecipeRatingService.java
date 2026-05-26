package com.receitasapi.api.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.MyRecipeReviewResponse;
import com.receitasapi.api.dto.RecipeRatingRequest;
import com.receitasapi.api.model.Recipe;
import com.receitasapi.api.model.RecipeRating;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.RecipeRatingRepository;
import com.receitasapi.api.repository.RecipeRepository;
import com.receitasapi.api.repository.UserRepository;

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

        public List<MyRecipeReviewResponse> listMyRatings(String username) {
                return recipeRatingRepository.findByUserUsernameOrderByIdDesc(username)
                                .stream()
                                .map(rating -> MyRecipeReviewResponse.builder()
                                                .id(rating.getId())
                                                .recipeId(rating.getRecipe().getId())
                                                .recipeName(rating.getRecipe().getName())
                                                .rating(rating.getRating())
                                                .comment(rating.getComment())
                                                .build())
                                .toList();
        }
}

