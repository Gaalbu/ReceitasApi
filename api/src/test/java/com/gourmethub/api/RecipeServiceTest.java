package com.gourmethub.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import com.gourmethub.api.dto.MealDbResponse;
import com.gourmethub.api.dto.RecipeCreateRequest;
import com.gourmethub.api.model.Recipe;
import com.gourmethub.api.model.User;
import com.gourmethub.api.repository.RecipeRepository;
import com.gourmethub.api.repository.UserRepository;
import com.gourmethub.api.service.RecipeService;

@ExtendWith(MockitoExtension.class)
public class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private RecipeService recipeService;

    @Test
    void deveBuscarReceitaExternaComSucesso() {
        MealDbResponse response = new MealDbResponse();
        when(restTemplate.getForObject(eq("https://www.themealdb.com/api/json/v1/1/search.php?s=bolo"),
                eq(MealDbResponse.class))).thenReturn(response);

        MealDbResponse result = recipeService.searchExternalRecipe("bolo");

        assertNotNull(result);
    }

    @Test
    void deveSalvarReceitaComUsuario() {
        RecipeCreateRequest request = new RecipeCreateRequest("Bolo de Chocolate", "Doce", "Misture e asse");
        User user = User.builder().id(1L).username("maria").email("maria@email.com").password("pass").build();
        Recipe saved = Recipe.builder().id(10L).name(request.getName()).user(user).build();

        when(userRepository.findByUsername("maria")).thenReturn(Optional.of(user));
        when(recipeRepository.save(any(Recipe.class))).thenReturn(saved);

        Recipe result = recipeService.createRecipe(request, "maria");

        assertNotNull(result);
        assertEquals("Bolo de Chocolate", result.getName());
        assertEquals("maria", result.getUser().getUsername());
    }
}
