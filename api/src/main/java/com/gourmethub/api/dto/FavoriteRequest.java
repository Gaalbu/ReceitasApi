package com.gourmethub.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteRequest {
    @JsonProperty("external_recipe_id")
    @NotBlank
    @Size(max = 50)
    private String externalRecipeId;

    @JsonProperty("recipe_name")
    @NotBlank
    @Size(max = 150)
    private String recipeName;

    @JsonProperty("image_url")
    @Size(max = 255)
    private String imageUrl;
}
