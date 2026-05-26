package com.receitasapi.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.receitasapi.api.dto.MealPlanRequest;
import com.receitasapi.api.dto.ShoppingListResponse;
import com.receitasapi.api.model.MealPlan;
import com.receitasapi.api.service.MealPlanService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/meal-plans")
@Validated
public class MealPlanController {
    private final MealPlanService mealPlanService;

    public MealPlanController(MealPlanService mealPlanService) {
        this.mealPlanService = mealPlanService;
    }

    @PostMapping
    public ResponseEntity<MealPlan> createMealPlan(@Valid @RequestBody MealPlanRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(mealPlanService.createMealPlan(request, authentication.getName()));
    }

    @DeleteMapping("/{mealPlanId}/items/{itemId}")
    public ResponseEntity<Void> deleteMealItem(@PathVariable Long mealPlanId,
                                               @PathVariable Long itemId,
                                               Authentication authentication) {
        mealPlanService.removeMealItem(mealPlanId, itemId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{mealPlanId}/shopping-list")
    public ResponseEntity<ShoppingListResponse> shoppingList(@PathVariable Long mealPlanId,
                                                             Authentication authentication) {
        return ResponseEntity.ok(mealPlanService.buildShoppingList(mealPlanId, authentication.getName()));
    }
}

