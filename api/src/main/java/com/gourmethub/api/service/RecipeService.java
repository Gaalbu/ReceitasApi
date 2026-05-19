package com.gourmethub.api.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.gourmethub.api.dto.MealDbResponse;
import com.gourmethub.api.dto.RecipeCreateRequest;
import com.gourmethub.api.model.Recipe;
import com.gourmethub.api.model.User;
import com.gourmethub.api.repository.RecipeRepository;
import com.gourmethub.api.repository.UserRepository;

@Service
public class RecipeService {
    private final RestTemplate restTemplate;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    public RecipeService(RestTemplate restTemplate, RecipeRepository recipeRepository, UserRepository userRepository) {
        this.restTemplate = restTemplate;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
    }

    public MealDbResponse searchExternalRecipe(String name) {
        String url = "https://www.themealdb.com/api/json/v1/1/search.php?s=" + name;
        return restTemplate.getForObject(url, MealDbResponse.class);
    }

    public Recipe createRecipe(RecipeCreateRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        Recipe recipe = Recipe.builder()
                .name(request.getName())
                .description(request.getDescription())
                .instructions(request.getInstructions())
                .user(user)
                .build();

        return recipeRepository.save(recipe);
    }
}
