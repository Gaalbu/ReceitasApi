package com.gourmethub.api.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.gourmethub.api.dto.FavoriteRequest;
import com.gourmethub.api.model.Favorite;
import com.gourmethub.api.model.User;
import com.gourmethub.api.repository.FavoriteRepository;
import com.gourmethub.api.repository.UserRepository;

@Service
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, UserRepository userRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
    }

    public Favorite addFavorite(FavoriteRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        return favoriteRepository.findByUserUsernameAndExternalRecipeId(username, request.getExternalRecipeId())
                .orElseGet(() -> favoriteRepository.save(Favorite.builder()
                        .user(user)
                        .externalRecipeId(request.getExternalRecipeId())
                        .recipeName(request.getRecipeName())
                        .imageUrl(request.getImageUrl())
                        .build()));
    }

    public List<Favorite> listMyFavorites(String username) {
        return favoriteRepository.findByUserUsernameOrderByIdDesc(username);
    }

    public void deleteFavorite(Long favoriteId, String username) {
        Favorite favorite = favoriteRepository.findByIdAndUserUsername(favoriteId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Favorito nao encontrado"));
        favoriteRepository.delete(favorite);
    }
}
