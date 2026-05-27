package com.receitasapi.api.service;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.MealItemRequest;
import com.receitasapi.api.dto.MealPlanRequest;
import com.receitasapi.api.dto.ShoppingListResponse;
import com.receitasapi.api.model.MealItem;
import com.receitasapi.api.model.MealPlan;
import com.receitasapi.api.model.MealType;
import com.receitasapi.api.model.Recipe;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.MealPlanRepository;
import com.receitasapi.api.repository.RecipeRepository;
import com.receitasapi.api.repository.UserRepository;

@Service
public class MealPlanService {
    private final MealPlanRepository mealPlanRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    public MealPlanService(MealPlanRepository mealPlanRepository, RecipeRepository recipeRepository,
                           UserRepository userRepository) {
        this.mealPlanRepository = mealPlanRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
    }

    public MealPlan createMealPlan(MealPlanRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        MealPlan mealPlan = new MealPlan();
        mealPlan.setPlanName(request.getPlan_name());
        try {
            // expect ISO date string: yyyy-MM-dd
            mealPlan.setStartDate(java.time.LocalDate.parse(request.getStart_date()));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start_date must be in yyyy-MM-dd format");
        }
        mealPlan.setUser(user);

        List<MealItem> items = new ArrayList<>();
        for (MealItemRequest itemRequest : request.getItems()) {
            Recipe recipe = recipeRepository.findById(itemRequest.getRecipe_id())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receita nao encontrada"));

            MealItem item = new MealItem();
            item.setDayOfWeek(DayOfWeek.valueOf(itemRequest.getDay_of_week().toUpperCase()));
            item.setMealType(MealType.valueOf(itemRequest.getMeal_type().toUpperCase()));
            item.setRecipe(recipe);
            item.setMealPlan(mealPlan);
            items.add(item);
        }
        mealPlan.setItems(items);

        return mealPlanRepository.save(mealPlan);
    }

    @Transactional
    public void removeMealItem(Long mealPlanId, Long itemId, String username) {
        MealPlan mealPlan = mealPlanRepository.findWithItemsByIdAndUserUsername(mealPlanId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano nao encontrado"));

        boolean removed = mealPlan.getItems().removeIf(item -> item.getId() != null && item.getId().equals(itemId));
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item do plano nao encontrado");
        }

        mealPlanRepository.save(mealPlan);
    }

    @Transactional(readOnly = true)
    public ShoppingListResponse buildShoppingList(Long mealPlanId, String username) {
        MealPlan mealPlan = mealPlanRepository.findWithItemsByIdAndUserUsername(mealPlanId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano nao encontrado"));

        Set<String> ingredients = new LinkedHashSet<>();
        for (MealItem item : mealPlan.getItems()) {
            if (item.getRecipe() == null || item.getRecipe().getDescription() == null) {
                continue;
            }
            for (String rawIngredient : item.getRecipe().getDescription().split("[\\n,;]+")) {
                String ingredient = rawIngredient.trim();
                if (!ingredient.isBlank()) {
                    ingredients.add(ingredient);
                }
            }
        }

        return ShoppingListResponse.builder()
                .mealPlanId(mealPlan.getId())
                .mealPlanName(mealPlan.getPlanName())
                .ingredients(new java.util.ArrayList<>(ingredients))
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<MealPlan> listMyMealPlans(String username) {
        return mealPlanRepository.findByUserUsernameOrderByIdDesc(username);
    }

    @Transactional(readOnly = true)
    public MealPlan getMyMealPlan(Long mealPlanId, String username) {
        return mealPlanRepository.findWithItemsByIdAndUserUsername(mealPlanId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano nao encontrado"));
    }

    public MealPlan updateMealPlan(Long mealPlanId, MealPlanRequest request, String username) {
        MealPlan mealPlan = mealPlanRepository.findWithItemsByIdAndUserUsername(mealPlanId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano nao encontrado"));

        mealPlan.setPlanName(request.getPlan_name());
        try {
            mealPlan.setStartDate(java.time.LocalDate.parse(request.getStart_date()));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start_date must be in yyyy-MM-dd format");
        }

        // rebuild items
        java.util.List<MealItem> items = new java.util.ArrayList<>();
        for (MealItemRequest itemRequest : request.getItems()) {
            Recipe recipe = recipeRepository.findById(itemRequest.getRecipe_id())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receita nao encontrada"));

            MealItem item = new MealItem();
            item.setDayOfWeek(java.time.DayOfWeek.valueOf(itemRequest.getDay_of_week().toUpperCase()));
            item.setMealType(MealType.valueOf(itemRequest.getMeal_type().toUpperCase()));
            item.setRecipe(recipe);
            item.setMealPlan(mealPlan);
            items.add(item);
        }
        mealPlan.setItems(items);

        return mealPlanRepository.save(mealPlan);
    }

    public void deleteMealPlan(Long mealPlanId, String username) {
        MealPlan mealPlan = mealPlanRepository.findByIdAndUserUsername(mealPlanId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano nao encontrado"));
        mealPlanRepository.delete(mealPlan);
    }
}

