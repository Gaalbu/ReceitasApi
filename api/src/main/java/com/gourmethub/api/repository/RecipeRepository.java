package com.gourmethub.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gourmethub.api.model.Recipe;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
	List<Recipe> findByUserUsernameOrderByIdDesc(String username);

	Optional<Recipe> findByIdAndUserUsername(Long id, String username);

	void deleteByUserUsername(String username);
}
