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
}

