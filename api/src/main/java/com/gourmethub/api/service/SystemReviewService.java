package com.gourmethub.api.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.gourmethub.api.dto.SystemReviewRequest;
import com.gourmethub.api.model.SystemReview;
import com.gourmethub.api.model.User;
import com.gourmethub.api.repository.SystemReviewRepository;
import com.gourmethub.api.repository.UserRepository;

@Service
public class SystemReviewService {
    private final SystemReviewRepository systemReviewRepository;
    private final UserRepository userRepository;

    public SystemReviewService(SystemReviewRepository systemReviewRepository, UserRepository userRepository) {
        this.systemReviewRepository = systemReviewRepository;
        this.userRepository = userRepository;
    }

    public SystemReview createReview(SystemReviewRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        SystemReview review = SystemReview.builder()
                .comment(request.getComment())
                .user(user)
                .build();

        return systemReviewRepository.save(review);
    }
}

