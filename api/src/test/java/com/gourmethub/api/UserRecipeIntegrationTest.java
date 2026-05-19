package com.gourmethub.api;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.gourmethub.api.model.Recipe;
import com.gourmethub.api.model.User;
import com.gourmethub.api.repository.RecipeRepository;
import com.gourmethub.api.repository.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase
@Transactional
class UserRecipeIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void devePersistirUsuarioEReceita() {
        User user = User.builder()
                .username("joao")
                .email("joao@email.com")
                .password(passwordEncoder.encode("senha123"))
                .build();
        User savedUser = userRepository.save(user);

        Recipe recipe = Recipe.builder()
                .name("Macarrao")
                .description("Receita simples")
                .instructions("Cozinhe e sirva")
                .user(savedUser)
                .build();
        Recipe savedRecipe = recipeRepository.save(recipe);

        assertNotNull(savedUser.getId());
        assertNotNull(savedRecipe.getId());
        assertEquals(savedUser.getId(), savedRecipe.getUser().getId());
    }
}

