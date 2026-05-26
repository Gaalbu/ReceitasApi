package com.receitasapi.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.MyRecipeReviewResponse;
import com.receitasapi.api.dto.RecipeRatingRequest;
import com.receitasapi.api.model.Recipe;
import com.receitasapi.api.model.RecipeRating;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.RecipeRatingRepository;
import com.receitasapi.api.repository.RecipeRepository;
import com.receitasapi.api.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class RecipeRatingServiceTest {

    @Mock
    private RecipeRatingRepository recipeRatingRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RecipeRatingService recipeRatingService;

    @Test
    void addRatingSavesRating() {
        Recipe recipe = Recipe.builder().id(10L).name("Bolo").build();
        User user = User.builder().id(1L).username("maria").build();
        RecipeRatingRequest request = new RecipeRatingRequest(5, "Muito bom");

        when(recipeRepository.findById(10L)).thenReturn(Optional.of(recipe));
        when(userRepository.findByUsername("maria")).thenReturn(Optional.of(user));
        when(recipeRatingRepository.save(any(RecipeRating.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RecipeRating rating = recipeRatingService.addRating(10L, request, "maria");

        assertEquals(5, rating.getRating());
        assertEquals("Muito bom", rating.getComment());
        assertEquals(recipe, rating.getRecipe());
        assertEquals(user, rating.getUser());
        verify(recipeRatingRepository).save(any(RecipeRating.class));
    }

    @Test
    void addRatingThrowsWhenRecipeMissing() {
        when(recipeRepository.findById(10L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> recipeRatingService.addRating(10L, new RecipeRatingRequest(4, "ok"), "maria"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void addRatingThrowsWhenUserMissing() {
        Recipe recipe = Recipe.builder().id(10L).name("Bolo").build();
        when(recipeRepository.findById(10L)).thenReturn(Optional.of(recipe));
        when(userRepository.findByUsername("maria")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> recipeRatingService.addRating(10L, new RecipeRatingRequest(4, "ok"), "maria"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void listMyRatingsMapsResponses() {
        Recipe recipe = Recipe.builder().id(7L).name("Bolo").build();
        RecipeRating rating = RecipeRating.builder()
                .id(22L)
                .rating(4)
                .comment("Bom")
                .recipe(recipe)
                .build();

        when(recipeRatingRepository.findByUserUsernameOrderByIdDesc("maria")).thenReturn(List.of(rating));

        List<MyRecipeReviewResponse> responses = recipeRatingService.listMyRatings("maria");

        assertEquals(1, responses.size());
        assertEquals(22L, responses.get(0).getId());
        assertEquals(7L, responses.get(0).getRecipeId());
        assertEquals("Bolo", responses.get(0).getRecipeName());
        assertEquals(4, responses.get(0).getRating());
        assertEquals("Bom", responses.get(0).getComment());
    }
}
