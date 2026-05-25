package com.gourmethub.api.service;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.gourmethub.api.dto.MealItemRequest;
import com.gourmethub.api.dto.MealPlanRequest;
import com.gourmethub.api.model.MealItem;
import com.gourmethub.api.model.MealPlan;
import com.gourmethub.api.model.MealType;
import com.gourmethub.api.model.Recipe;
import com.gourmethub.api.model.User;
import com.gourmethub.api.repository.MealPlanRepository;
import com.gourmethub.api.repository.RecipeRepository;
import com.gourmethub.api.repository.UserRepository;

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
}

