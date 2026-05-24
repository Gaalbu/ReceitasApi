package com.gourmethub.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyRecipeReviewResponse {
    private Long id;
    private Long recipeId;
    private String recipeName;
    private int rating;
    private String comment;
}
