package com.receitasapi.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.receitasapi.api.model.Favorite;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserUsernameOrderByIdDesc(String username);

    Optional<Favorite> findByIdAndUserUsername(Long id, String username);

    Optional<Favorite> findByUserUsernameAndExternalRecipeId(String username, String externalRecipeId);

    void deleteByUserUsername(String username);
}
