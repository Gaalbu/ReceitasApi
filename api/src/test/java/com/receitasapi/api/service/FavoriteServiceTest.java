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

import com.receitasapi.api.dto.FavoriteRequest;
import com.receitasapi.api.model.Favorite;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.FavoriteRepository;
import com.receitasapi.api.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FavoriteService favoriteService;

    @Test
    void addFavoriteCreatesWhenMissing() {
        User user = User.builder().id(1L).username("joao").build();
        FavoriteRequest request = new FavoriteRequest("12", "Bolo", "img");

        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByUserUsernameAndExternalRecipeId("joao", "12")).thenReturn(Optional.empty());
        when(favoriteRepository.save(any(Favorite.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Favorite favorite = favoriteService.addFavorite(request, "joao");

        assertEquals("12", favorite.getExternalRecipeId());
        assertEquals("Bolo", favorite.getRecipeName());
    }

    @Test
    void addFavoriteReturnsExistingWhenDuplicated() {
        User user = User.builder().id(1L).username("joao").build();
        Favorite existing = Favorite.builder().id(5L).externalRecipeId("12").user(user).build();

        when(userRepository.findByUsername("joao")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByUserUsernameAndExternalRecipeId("joao", "12")).thenReturn(Optional.of(existing));

        Favorite favorite = favoriteService.addFavorite(new FavoriteRequest("12", "Bolo", "img"), "joao");

        assertEquals(existing, favorite);
    }

    @Test
    void listMyFavoritesDelegatesToRepository() {
        when(favoriteRepository.findByUserUsernameOrderByIdDesc("joao")).thenReturn(List.of());

        assertEquals(0, favoriteService.listMyFavorites("joao").size());
    }

    @Test
    void deleteFavoriteDeletesExistingFavorite() {
        User user = User.builder().id(1L).username("joao").build();
        Favorite favorite = Favorite.builder().id(7L).user(user).build();

        when(favoriteRepository.findByIdAndUserUsername(7L, "joao")).thenReturn(Optional.of(favorite));

        favoriteService.deleteFavorite(7L, "joao");

        verify(favoriteRepository).delete(favorite);
    }

    @Test
    void deleteFavoriteThrowsWhenMissing() {
        when(favoriteRepository.findByIdAndUserUsername(7L, "joao")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> favoriteService.deleteFavorite(7L, "joao"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
}
