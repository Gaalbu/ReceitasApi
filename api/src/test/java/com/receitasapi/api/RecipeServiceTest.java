package com.receitasapi.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.MealDbResponse;
import com.receitasapi.api.dto.RecipeCreateRequest;
import com.receitasapi.api.model.Recipe;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.RecipeRepository;
import com.receitasapi.api.repository.UserRepository;
import com.receitasapi.api.service.RecipeService;

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

    @Test
    void deveRetornarRespostaVaziaQuandoApiExternaRetornaNull() {
        when(restTemplate.getForObject(eq("https://www.themealdb.com/api/json/v1/1/search.php?s=bolo"),
                eq(MealDbResponse.class))).thenReturn(null);

        MealDbResponse result = recipeService.searchExternalRecipe("bolo");

        assertNotNull(result);
        assertEquals(null, result.getMeals());
    }

    @Test
    void deveLancarErroQuandoApiExternaFalhar() {
        when(restTemplate.getForObject(eq("https://www.themealdb.com/api/json/v1/1/search.php?s=bolo"),
                eq(MealDbResponse.class))).thenThrow(new org.springframework.web.client.RestClientException("boom"));

        assertThrows(ResponseStatusException.class, () -> recipeService.searchExternalRecipe("bolo"));
    }

    @Test
    void deveListarReceitasDoUsuario() {
        when(recipeRepository.findByUserUsernameOrderByIdDesc("maria")).thenReturn(java.util.List.of());

        assertEquals(0, recipeService.listMyRecipes("maria").size());
    }

    @Test
    void deveAtualizarReceitaDoUsuario() {
        User user = User.builder().id(1L).username("maria").build();
        Recipe recipe = Recipe.builder().id(10L).name("Antiga").description("old").instructions("old").isExternal(true).externalApiId("123").user(user).build();
        RecipeCreateRequest request = new RecipeCreateRequest("Nova", "ing", "passos");

        when(recipeRepository.findByIdAndUserUsername(10L, "maria")).thenReturn(Optional.of(recipe));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Recipe result = recipeService.updateRecipe(10L, request, "maria");

        assertEquals("Nova", result.getName());
        assertEquals("ing", result.getDescription());
        assertEquals("passos", result.getInstructions());
        assertEquals(false, result.isExternal());
        assertEquals(null, result.getExternalApiId());
    }

    @Test
    void deveLancarErroAoAtualizarReceitaInexistente() {
        when(recipeRepository.findByIdAndUserUsername(10L, "maria")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> recipeService.updateRecipe(10L, new RecipeCreateRequest("Nova", "ing", "passos"), "maria"));
        verify(recipeRepository, never()).save(any());
    }

    @Test
    void deveExcluirReceitaDoUsuario() {
        User user = User.builder().id(1L).username("maria").build();
        Recipe recipe = Recipe.builder().id(10L).name("Antiga").user(user).build();
        when(recipeRepository.findByIdAndUserUsername(10L, "maria")).thenReturn(Optional.of(recipe));

        recipeService.deleteRecipe(10L, "maria");

        verify(recipeRepository).delete(recipe);
    }

    @Test
    void deveLancarErroAoExcluirReceitaInexistente() {
        when(recipeRepository.findByIdAndUserUsername(10L, "maria")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> recipeService.deleteRecipe(10L, "maria"));
    }
}
