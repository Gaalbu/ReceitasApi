package com.receitasapi.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.receitasapi.api.dto.FavoriteRequest;
import com.receitasapi.api.model.Favorite;
import com.receitasapi.api.service.FavoriteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/favorites")
@Validated
public class FavoriteController {
    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping
    public ResponseEntity<Favorite> addFavorite(@Valid @RequestBody FavoriteRequest request,
                                                Authentication authentication) {
        return ResponseEntity.ok(favoriteService.addFavorite(request, authentication.getName()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Favorite>> myFavorites(Authentication authentication) {
        return ResponseEntity.ok(favoriteService.listMyFavorites(authentication.getName()));
    }

    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<Void> deleteFavorite(@PathVariable Long favoriteId, Authentication authentication) {
        favoriteService.deleteFavorite(favoriteId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
