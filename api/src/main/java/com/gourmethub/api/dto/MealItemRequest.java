package com.gourmethub.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MealItemRequest {

    @NotNull(message = "O ID da receita não pode ser nulo")
    private Long recipe_id;

    @NotBlank(message = "O dia da semana não pode estar em branco")
    private String day_of_week;

    @NotBlank(message = "O tipo de refeição não pode estar em branco")
    private String meal_type;
}

