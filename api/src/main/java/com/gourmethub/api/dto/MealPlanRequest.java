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
    // campos usam snake case pq vem assim do json
    private String plan_name;

    private String start_date;

    @NotEmpty
    @Valid
    private List<MealItemRequest> items;
}

