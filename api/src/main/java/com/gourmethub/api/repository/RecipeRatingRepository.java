package com.gourmethub.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gourmethub.api.model.RecipeRating;

public interface RecipeRatingRepository extends JpaRepository<RecipeRating, Long> {
}

