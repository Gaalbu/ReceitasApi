package com.receitasapi.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.receitasapi.api.dto.LoginRequest;
import com.receitasapi.api.dto.MealItemRequest;
import com.receitasapi.api.dto.MealPlanRequest;
import com.receitasapi.api.dto.RecipeCreateRequest;
import com.receitasapi.api.dto.RegisterRequest;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MealPlanFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createRecipeAndMealPlanWithJwt() throws Exception {
        String token = registerAndLogin("maria", "maria@email.com", "senha123");

        RecipeCreateRequest recipeRequest = new RecipeCreateRequest(
                "Macarrao", "Massa e molho", "Cozinhe e sirva");

        MvcResult recipeResult = mockMvc.perform(post("/recipes")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(recipeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn();

        JsonNode recipeJson = objectMapper.readTree(recipeResult.getResponse().getContentAsString());
        long recipeId = recipeJson.get("id").asLong();

        MealItemRequest item = new MealItemRequest(recipeId, "monday", "lunch");
        MealPlanRequest planRequest = new MealPlanRequest("Plano semanal", "2026-01-01", List.of(item));

        mockMvc.perform(post("/meal-plans")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(planRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.planName").value("Plano semanal"));
    }

    private String registerAndLogin(String username, String email, String password) throws Exception {
        RegisterRequest register = new RegisterRequest(username, email, password);

        MvcResult registerResult = mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode registerJson = objectMapper.readTree(registerResult.getResponse().getContentAsString());
        String token = registerJson.get("token").asText();
        if (token != null && !token.isBlank()) {
            return token;
        }

        LoginRequest login = new LoginRequest(username, password);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        return loginJson.get("token").asText();
    }
}
