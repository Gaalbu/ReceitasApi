package com.receitasapi.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.receitasapi.api.model.RecipeRating;

public interface RecipeRatingRepository extends JpaRepository<RecipeRating, Long> {
	List<RecipeRating> findByUserUsernameOrderByIdDesc(String username);

	void deleteByUserUsername(String username);
}

