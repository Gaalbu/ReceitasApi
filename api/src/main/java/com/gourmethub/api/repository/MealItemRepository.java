package com.receitasapi.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.receitasapi.api.model.MealItem;

public interface MealItemRepository extends JpaRepository<MealItem, Long> {
}

