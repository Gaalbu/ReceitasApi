package com.gourmethub.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gourmethub.api.model.MealItem;

public interface MealItemRepository extends JpaRepository<MealItem, Long> {
}

