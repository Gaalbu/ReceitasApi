package com.receitasapi.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.receitasapi.api.model.MealPlan;
import com.receitasapi.api.model.Recipe;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.MealPlanRepository;
import com.receitasapi.api.repository.RecipeRepository;
import com.receitasapi.api.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MealPlanControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private MealPlanRepository mealPlanRepository;

    @BeforeEach
    void clean() {
        mealPlanRepository.deleteAll();
        recipeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "maria")
    void shouldCrudMealPlan() throws Exception {
        User user = userRepository.save(User.builder().username("maria").email("maria@example.com").password("x").build());
        Recipe recipe = recipeRepository.save(Recipe.builder().name("Bolo").description("Farinha").instructions("Assar").user(user).build());

        String createBody = "{\"plan_name\":\"Semana 1\",\"start_date\":\"2026-06-08\",\"items\":[{\"recipe_id\":" + recipe.getId() + ",\"day_of_week\":\"MONDAY\",\"meal_type\":\"LUNCH\"}]}";
        mockMvc.perform(post("/meal-plans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planName").value("Semana 1"));

        MealPlan saved = mealPlanRepository.findAll().get(0);

        mockMvc.perform(get("/meal-plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(1)));

        mockMvc.perform(put("/meal-plans/{id}", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"plan_name\":\"Semana 2\",\"week_number\":3}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planName").value("Semana 2"))
                .andExpect(jsonPath("$.weekNumber").value(3));

        mockMvc.perform(delete("/meal-plans/{id}", saved.getId()))
                .andExpect(status().isNoContent());
    }
}
