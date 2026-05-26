package com.receitasapi.api.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.AuthResponse;
import com.receitasapi.api.dto.UpdateProfileRequest;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.FavoriteRepository;
import com.receitasapi.api.repository.MealPlanRepository;
import com.receitasapi.api.repository.RecipeRatingRepository;
import com.receitasapi.api.repository.RecipeRepository;
import com.receitasapi.api.repository.SystemReviewRepository;
import com.receitasapi.api.repository.UserRepository;
import com.receitasapi.api.security.JwtService;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final MealPlanRepository mealPlanRepository;
    private final RecipeRatingRepository recipeRatingRepository;
    private final SystemReviewRepository systemReviewRepository;
    private final FavoriteRepository favoriteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, RecipeRepository recipeRepository,
                       MealPlanRepository mealPlanRepository, RecipeRatingRepository recipeRatingRepository,
                       SystemReviewRepository systemReviewRepository, FavoriteRepository favoriteRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
        this.mealPlanRepository = mealPlanRepository;
        this.recipeRatingRepository = recipeRatingRepository;
        this.systemReviewRepository = systemReviewRepository;
        this.favoriteRepository = favoriteRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse updateProfile(UpdateProfileRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        String trimmedUsername = normalize(request.getUsername());
        String trimmedEmail = normalize(request.getEmail());
        String trimmedPassword = normalize(request.getPassword());

        if (trimmedUsername != null && !trimmedUsername.equals(user.getUsername())
                && userRepository.existsByUsername(trimmedUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username ja existe");
        }
        if (trimmedEmail != null && !trimmedEmail.equals(user.getEmail())
                && userRepository.existsByEmail(trimmedEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email ja existe");
        }

        if (trimmedUsername != null) {
            user.setUsername(trimmedUsername);
        }
        if (trimmedEmail != null) {
            user.setEmail(trimmedEmail);
        }
        if (trimmedPassword != null) {
            user.setPassword(passwordEncoder.encode(trimmedPassword));
        }

        User saved = userRepository.save(user);
        return AuthResponse.builder()
                .token(jwtService.generateToken(saved))
                .username(saved.getUsername())
                .email(saved.getEmail())
                .build();
    }

    @Transactional
    public void deleteAccount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        mealPlanRepository.deleteByUserUsername(username);
        recipeRatingRepository.deleteByUserUsername(username);
        favoriteRepository.deleteByUserUsername(username);
        systemReviewRepository.deleteByUserUsername(username);
        recipeRepository.deleteByUserUsername(username);
        userRepository.delete(user);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
