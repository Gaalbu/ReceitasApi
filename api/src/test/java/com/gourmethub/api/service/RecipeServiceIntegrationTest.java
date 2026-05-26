package com.receitasapi.api.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.MealDbResponse;
import com.receitasapi.api.dto.RecipeCreateRequest;
import com.receitasapi.api.model.Recipe;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.MealItemRepository;
import com.receitasapi.api.repository.MealPlanRepository;
import com.receitasapi.api.repository.RecipeRepository;
import com.receitasapi.api.repository.UserRepository;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import org.springframework.http.HttpStatus;

@SpringBootTest
public class RecipeServiceIntegrationTest {

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private MealPlanRepository mealPlanRepository;

    @Autowired
    private MealItemRepository mealItemRepository;

    @Autowired
    private RestTemplate restTemplate;

    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        mockServer = MockRestServiceServer.createServer(restTemplate);
        mealItemRepository.deleteAll();
        mealPlanRepository.deleteAll();
        recipeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createRecipe_savesRecipe() {
        User user = User.builder().username("maria").email("maria@example.com").password("x").build();
        userRepository.save(user);

        RecipeCreateRequest req = new RecipeCreateRequest("Bolo","Farinha e ovos","Misturar e assar");
        Recipe saved = recipeService.createRecipe(req, "maria");

        assertNotNull(saved.getId());
        assertEquals("Bolo", saved.getName());
    }

    @Test
    void searchExternalRecipe_returnsMeals() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("search.php?s=chicken")))
                .andRespond(withSuccess("{\"meals\":[{\"idMeal\":\"1\",\"strMeal\":\"Chicken\"}]}", MediaType.APPLICATION_JSON));

        MealDbResponse resp = recipeService.searchExternalRecipe("chicken");
        assertNotNull(resp);
        assertNotNull(resp.getMeals());
        assertEquals(1, resp.getMeals().size());

        mockServer.verify();
    }

    @Test
    void searchExternalRecipe_throwsWhenRemoteFails() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("search.php?s=broken")))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThrows(ResponseStatusException.class, () -> recipeService.searchExternalRecipe("broken"));
    }
}
