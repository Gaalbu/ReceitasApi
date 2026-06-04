package com.receitasapi.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MealItemRequest {

    private Long recipe_id;

    @JsonProperty("external_recipe_id")
    @Size(max = 50)
    private String externalRecipeId;

    @JsonProperty("external_recipe_name")
    @Size(max = 150)
    private String externalRecipeName;

    @NotBlank(message = "O dia da semana não pode estar em branco")
    private String day_of_week;

    @NotBlank(message = "O tipo de refeição não pode estar em branco")
    private String meal_type;
}

