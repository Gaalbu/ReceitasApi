package com.gourmethub.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
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

@ExtendWith(MockitoExtension.class)
class MealPlanServiceTest {

    @Mock
    private MealPlanRepository mealPlanRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MealPlanService mealPlanService;

    @Test
    void createMealPlanRejectsInvalidDate() {
        User user = User.builder().id(1L).username("joao").build();
        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));

        MealItemRequest item = new MealItemRequest(10L, "monday", "lunch");
        MealPlanRequest request = new MealPlanRequest("Plano", "2026/01/01", List.of(item));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> mealPlanService.createMealPlan(request, "joao"));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(mealPlanRepository, never()).save(any(MealPlan.class));
    }

    @Test
    void createMealPlanThrowsWhenUserMissing() {
        MealItemRequest item = new MealItemRequest(10L, "monday", "lunch");
        MealPlanRequest request = new MealPlanRequest("Plano", "2026-01-01", List.of(item));

        when(userRepository.findByUsername("joao")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> mealPlanService.createMealPlan(request, "joao"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void createMealPlanThrowsWhenRecipeMissing() {
        User user = User.builder().id(1L).username("joao").build();
        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));
        when(recipeRepository.findById(10L)).thenReturn(Optional.empty());

        MealItemRequest item = new MealItemRequest(10L, "monday", "lunch");
        MealPlanRequest request = new MealPlanRequest("Plano", "2026-01-01", List.of(item));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> mealPlanService.createMealPlan(request, "joao"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void createMealPlanBuildsItemsWithEnums() {
        User user = User.builder().id(1L).username("joao").build();
        Recipe recipe = Recipe.builder().id(10L).name("Bolo").user(user).build();

        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));
        when(recipeRepository.findById(10L)).thenReturn(Optional.of(recipe));
        when(mealPlanRepository.save(any(MealPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MealItemRequest item = new MealItemRequest(10L, "monday", "lunch");
        MealPlanRequest request = new MealPlanRequest("Plano", "2026-01-01", List.of(item));

        MealPlan result = mealPlanService.createMealPlan(request, "joao");

        assertEquals("Plano", result.getPlanName());
        assertEquals(LocalDate.parse("2026-01-01"), result.getStartDate());
        assertEquals(1, result.getItems().size());

        MealItem savedItem = result.getItems().get(0);
        assertEquals(DayOfWeek.MONDAY, savedItem.getDayOfWeek());
        assertEquals(MealType.LUNCH, savedItem.getMealType());
        assertEquals(recipe.getId(), savedItem.getRecipe().getId());
    }
}
