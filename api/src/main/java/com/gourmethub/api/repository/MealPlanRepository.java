package com.gourmethub.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gourmethub.api.model.MealPlan;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
}

