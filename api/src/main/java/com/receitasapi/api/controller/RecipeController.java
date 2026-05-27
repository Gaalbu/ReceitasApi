package com.receitasapi.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.receitasapi.api.dto.MealDbMeal;
import com.receitasapi.api.dto.MealDbResponse;
import com.receitasapi.api.dto.RecipeCreateRequest;
import com.receitasapi.api.model.Recipe;
import com.receitasapi.api.service.RecipeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/recipes")
@Validated
public class RecipeController {
    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping
    public ResponseEntity<Recipe> createRecipe(@Valid @RequestBody RecipeCreateRequest request,
                                               Authentication authentication) {
        Recipe recipe = recipeService.createRecipe(request, authentication.getName());
        return ResponseEntity.ok(recipe);
    }

    @GetMapping("/me")
    public ResponseEntity<List<Recipe>> myRecipes(Authentication authentication) {
        return ResponseEntity.ok(recipeService.listMyRecipes(authentication.getName()));
    }

    @GetMapping("/{recipeId}")
    public ResponseEntity<Recipe> myRecipe(@PathVariable Long recipeId, Authentication authentication) {
        return ResponseEntity.ok(recipeService.getMyRecipe(recipeId, authentication.getName()));
    }

    @PutMapping("/{recipeId}")
    public ResponseEntity<Recipe> updateRecipe(@PathVariable Long recipeId,
                                               @Valid @RequestBody RecipeCreateRequest request,
                                               Authentication authentication) {
        return ResponseEntity.ok(recipeService.updateRecipe(recipeId, request, authentication.getName()));
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long recipeId, Authentication authentication) {
        recipeService.deleteRecipe(recipeId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/external/{externalId}")
    public ResponseEntity<MealDbMeal> externalDetails(@PathVariable String externalId) {
        return ResponseEntity.ok(recipeService.getExternalRecipeDetails(externalId));
    }

    @GetMapping("/search")
    public ResponseEntity<MealDbResponse> searchExternal(@RequestParam("name") String name) {
        return ResponseEntity.ok(recipeService.searchExternalRecipe(name));
    }
}

