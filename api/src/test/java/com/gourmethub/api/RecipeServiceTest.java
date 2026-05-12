package com.gourmethub.api;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;

@ExtendWith(MockitoExtension.class)
public class RecipeServiceTest {
    
    @Mock
    private RecipeRepository recipeRepository;

    @InjectMocks
    private RecipeService recipeService;

    @Test
    void deveSalvarReceitaComSucesso() {
        Recipe recipe = new Recipe();
        recipe.setName("Bolo de Chocolate");
        when(recipeRepository.save(any(Recipe.class))).thenReturn(recipe);

        Recipe savedRecipe = recipeService.saveRecipe(recipe);

        assertNotNull(savedRecipe); //Se salvo é não nulo.
        assertEquals("Bolo de Chocolate", savedRecipe.getName());
    }

}
