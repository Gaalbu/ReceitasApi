package com.gourmethub.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gourmethub.api.model.Recipe;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
}
