package com.gourmethub.api.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanRequest {
    private String name;

    @NotEmpty
    @Valid
    private List<MealItemRequest> items;
}

