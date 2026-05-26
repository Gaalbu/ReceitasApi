package com.receitasapi.api.service;

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

    @Test
    void removeMealItemDeletesExistingItem() {
        User user = User.builder().id(1L).username("joao").build();
        MealPlan plan = new MealPlan();
        plan.setId(99L);
        plan.setUser(user);

        MealItem item = new MealItem();
        item.setId(7L);
        item.setMealPlan(plan);
        plan.setItems(new java.util.ArrayList<>(List.of(item)));

        when(mealPlanRepository.findWithItemsByIdAndUserUsername(99L, "joao")).thenReturn(Optional.of(plan));
        when(mealPlanRepository.save(any(MealPlan.class))).thenReturn(plan);

        mealPlanService.removeMealItem(99L, 7L, "joao");

        assertEquals(0, plan.getItems().size());
        verify(mealPlanRepository).save(plan);
    }

    @Test
    void removeMealItemThrowsWhenMissing() {
        when(mealPlanRepository.findWithItemsByIdAndUserUsername(99L, "joao")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> mealPlanService.removeMealItem(99L, 7L, "joao"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void buildShoppingListDeduplicatesIngredientsAndSkipsBlankDescriptions() {
        User user = User.builder().id(1L).username("joao").build();
        MealPlan plan = new MealPlan();
        plan.setId(99L);
        plan.setPlanName("Semana");
        plan.setUser(user);

        Recipe recipe1 = Recipe.builder().id(10L).description("ovo, leite\nfarinha").build();
        Recipe recipe2 = Recipe.builder().id(11L).description(" leite ; açúcar ;  \n").build();
        Recipe recipe3 = Recipe.builder().id(12L).description(null).build();

        MealItem item1 = new MealItem();
        item1.setRecipe(recipe1);
        MealItem item2 = new MealItem();
        item2.setRecipe(recipe2);
        MealItem item3 = new MealItem();
        item3.setRecipe(recipe3);
        plan.setItems(new java.util.ArrayList<>(List.of(item1, item2, item3)));

        when(mealPlanRepository.findWithItemsByIdAndUserUsername(99L, "joao")).thenReturn(Optional.of(plan));

        ShoppingListResponse response = mealPlanService.buildShoppingList(99L, "joao");

        assertEquals(99L, response.getMealPlanId());
        assertEquals("Semana", response.getMealPlanName());
        assertEquals(List.of("ovo", "leite", "farinha", "açúcar"), response.getIngredients());
    }
}
