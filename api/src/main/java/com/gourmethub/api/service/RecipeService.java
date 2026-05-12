package com.gourmethub.api.service;

import org.springframework.stereotype.Service;

import com.gourmethub.api.config.RestTemplate;

@Service
public class RecipeService {
    private final RestTemplate restTemplate;

    public RecipeService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Object searchExternalRecipe(String nome){
        String Url = "https://www.themealdb.com/api/json/v1/1/search.php?s=" + nome;
        return restTemplate.getForObject(Url, Object.class);
    }

}
