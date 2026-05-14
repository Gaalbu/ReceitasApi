package com.gourmethub.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealItemRequest {
    @NotBlank
    private String dayOfWeek;

    @NotBlank
    private String mealType;

    @NotNull
    private Long recipeId;
}

