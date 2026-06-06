package com.receitasapi.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.receitasapi.api.dto.LoginRequest;
import com.receitasapi.api.dto.RegisterRequest;
import com.receitasapi.api.repository.FavoriteRepository;
import com.receitasapi.api.repository.MealItemRepository;
import com.receitasapi.api.repository.MealPlanRepository;
import com.receitasapi.api.repository.RecipeRatingRepository;
import com.receitasapi.api.repository.RecipeRepository;
import com.receitasapi.api.repository.SystemReviewRepository;
import com.receitasapi.api.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private MealPlanRepository mealPlanRepository;

    @Autowired
    private MealItemRepository mealItemRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private RecipeRatingRepository recipeRatingRepository;

    @Autowired
    private SystemReviewRepository systemReviewRepository;

    @BeforeEach
    void clean() {
        mealItemRepository.deleteAll();
        mealPlanRepository.deleteAll();
        favoriteRepository.deleteAll();
        recipeRatingRepository.deleteAll();
        systemReviewRepository.deleteAll();
        recipeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registerAndLoginFlowReturnsJwt() throws Exception {
        RegisterRequest register = new RegisterRequest("carla", "carla@email.com", "senha123");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("carla"))
                .andExpect(jsonPath("$.email").value("carla@email.com"));

        LoginRequest login = new LoginRequest("carla", "senha123");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }
}
