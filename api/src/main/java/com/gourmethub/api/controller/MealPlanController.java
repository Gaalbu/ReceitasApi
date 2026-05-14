package com.gourmethub.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gourmethub.api.dto.MealPlanRequest;
import com.gourmethub.api.model.MealPlan;
import com.gourmethub.api.service.MealPlanService;

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
}

