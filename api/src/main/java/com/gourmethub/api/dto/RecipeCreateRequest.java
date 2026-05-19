package com.gourmethub.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeCreateRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @Size(max = 4000)
    private String instructions;

    // use snake_case so incoming JSON like { "prep_time": 30 } maps to this field
    private Integer prep_time;

    public String getTitle() {
        return name;
    }

    public String getIngredients() {
        return description;
    }

    // keep backward-compatible constructor used in tests (name, description, instructions)
    public RecipeCreateRequest(String name, String description, String instructions) {
        this.name = name;
        this.description = description;
        this.instructions = instructions;
    }


}

