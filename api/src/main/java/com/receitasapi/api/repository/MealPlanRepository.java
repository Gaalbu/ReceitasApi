package com.receitasapi.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.receitasapi.api.model.MealPlan;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
	Optional<MealPlan> findByIdAndUserUsername(Long id, String username);

	@EntityGraph(attributePaths = { "items" })
	Optional<MealPlan> findWithItemsByIdAndUserUsername(Long id, String username);

	List<MealPlan> findByUserUsernameOrderByIdDesc(String username);

	void deleteByUserUsername(String username);
}

