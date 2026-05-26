package com.receitasapi.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class MealDbMeal {
    @JsonProperty("idMeal")
    private String idMeal;

    @JsonProperty("strMeal")
    private String name;

    @JsonProperty("strInstructions")
    private String instructions;

    @JsonProperty("strMealThumb")
    private String thumbnail;
}

