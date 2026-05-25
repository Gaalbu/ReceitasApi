package com.gourmethub.api.service;

import static org.junit.jupiter.api.Assertions.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.gourmethub.api.dto.MealItemRequest;
import com.gourmethub.api.dto.MealPlanRequest;
import com.gourmethub.api.model.MealPlan;
import com.gourmethub.api.model.Recipe;
import com.gourmethub.api.model.User;
import com.gourmethub.api.repository.MealPlanRepository;
import com.gourmethub.api.repository.RecipeRepository;
import com.gourmethub.api.repository.UserRepository;

@SpringBootTest
public class MealPlanServiceIntegrationTest {

    @Autowired
    private MealPlanService mealPlanService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private MealPlanRepository mealPlanRepository;

    @BeforeEach
    void setUp() {
        mealPlanRepository.deleteAll();
        recipeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createMealPlan_persistsItems() {
        User user = User.builder().username("joao").email("joao@example.com").password("x").build();
        user = userRepository.save(user);

        Recipe recipe = new Recipe();
        recipe.setName("Arroz");
        recipe.setDescription("Arroz, agua, sal");
        recipe.setInstructions("Cozinhar e servir");
        recipe.setUser(user);
        recipe = recipeRepository.save(recipe);

        MealItemRequest item = new MealItemRequest(recipe.getId(), "MONDAY", "LUNCH");
        MealPlanRequest req = new MealPlanRequest("Plano A", LocalDate.now().toString(), List.of(item));

        MealPlan plan = mealPlanService.createMealPlan(req, "joao");

        assertNotNull(plan.getId());
        assertEquals(1, plan.getItems().size());
        assertEquals(DayOfWeek.MONDAY, plan.getItems().get(0).getDayOfWeek());
    }
}
