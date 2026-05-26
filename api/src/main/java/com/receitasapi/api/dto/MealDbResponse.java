package com.receitasapi.api.dto;

import java.util.List;

import lombok.Data;

@Data
public class MealDbResponse {
    private List<MealDbMeal> meals;
}

