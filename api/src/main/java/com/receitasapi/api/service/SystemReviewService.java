package com.receitasapi.api.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.SystemReviewRequest;
import com.receitasapi.api.model.SystemReview;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.SystemReviewRepository;
import com.receitasapi.api.repository.UserRepository;

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

