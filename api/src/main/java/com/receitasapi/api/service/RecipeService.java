package com.receitasapi.api.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.MealDbMeal;
import com.receitasapi.api.dto.MealDbResponse;
import com.receitasapi.api.dto.RecipeCreateRequest;
import com.receitasapi.api.model.Recipe;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.RecipeRepository;
import com.receitasapi.api.repository.UserRepository;

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
        try {
            MealDbResponse resp = restTemplate.getForObject(url, MealDbResponse.class);
            if (resp == null) {
                // return an empty response rather than NPE
                return new MealDbResponse();
            }
            return resp;
        } catch (org.springframework.web.client.RestClientException ex) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY,
                    "Failed to fetch external recipes", ex);
        }
    }

    public MealDbMeal getExternalRecipeDetails(String id) {
        String url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id;
        try {
            MealDbResponse resp = restTemplate.getForObject(url, MealDbResponse.class);
            if (resp == null || resp.getMeals() == null || resp.getMeals().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Receita externa nao encontrada");
            }
            return resp.getMeals().get(0);
        } catch (org.springframework.web.client.RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Failed to fetch external recipe details", ex);
        }
    }

    public List<Recipe> listMyRecipes(String username) {
        return recipeRepository.findByUserUsernameOrderByIdDesc(username);
    }

    public Recipe getMyRecipe(Long recipeId, String username) {
        return recipeRepository.findByIdAndUserUsername(recipeId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receita nao encontrada"));
    }

    public Recipe updateRecipe(Long recipeId, RecipeCreateRequest request, String username) {
        Recipe recipe = recipeRepository.findByIdAndUserUsername(recipeId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receita nao encontrada"));

        recipe.setName(request.getTitle());
        recipe.setDescription(request.getIngredients());
        recipe.setInstructions(request.getInstructions());
        recipe.setPrepTime(request.getPrep_time());
        recipe.setExternal(false);
        recipe.setExternalApiId(null);

        return recipeRepository.save(recipe);
    }

    public void deleteRecipe(Long recipeId, String username) {
        Recipe recipe = recipeRepository.findByIdAndUserUsername(recipeId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receita nao encontrada"));
        recipeRepository.delete(recipe);
    }

    public Recipe createRecipe(RecipeCreateRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        Recipe recipe = new Recipe();
        recipe.setName(request.getTitle());
        recipe.setDescription(request.getIngredients());
        recipe.setInstructions(request.getInstructions());
        recipe.setPrepTime(request.getPrep_time());
        recipe.setUser(user);

        return recipeRepository.save(recipe);
    }
}
