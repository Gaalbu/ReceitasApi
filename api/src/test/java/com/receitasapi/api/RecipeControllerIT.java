package com.receitasapi.api;

import static org.hamcrest.Matchers.hasSize;
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
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import com.receitasapi.api.model.Recipe;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.RecipeRepository;
import com.receitasapi.api.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RecipeControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @MockBean
    private RestTemplate restTemplate;

    @BeforeEach
    void clean() {
        recipeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldRejectCreateWithoutAuthentication() throws Exception {
        mockMvc.perform(post("/recipes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Bolo\",\"description\":\"Farinha\",\"instructions\":\"Misturar\"}"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "maria")
    void shouldCreateUpdateAndDeleteRecipe() throws Exception {
        User user = userRepository.save(User.builder().username("maria").email("maria@example.com").password("x").build());

        mockMvc.perform(post("/recipes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Bolo\",\"description\":\"Farinha\",\"instructions\":\"Misturar\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Bolo"));

        Recipe saved = recipeRepository.findAll().get(0);
        saved.setUser(user);
        recipeRepository.save(saved);

        mockMvc.perform(put("/recipes/{id}", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Bolo Novo\",\"description\":\"Leite\",\"instructions\":\"Assar\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Bolo Novo"));

        mockMvc.perform(delete("/recipes/{id}", saved.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "maria")
    void shouldForbidUpdatingRecipeOfAnotherUser() throws Exception {
        User owner = userRepository.save(User.builder().username("joao").email("joao@example.com").password("x").build());
        Recipe recipe = recipeRepository.save(Recipe.builder().name("Bolo").description("Farinha").instructions("Assar").user(owner).build());

        mockMvc.perform(put("/recipes/{id}", recipe.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Bolo Novo\",\"description\":\"Leite\",\"instructions\":\"Assar\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldSearchExternalRecipes() throws Exception {
        mockMvc.perform(get("/recipes/search").param("name", "bolo"))
                .andExpect(status().isOk());
    }
}
