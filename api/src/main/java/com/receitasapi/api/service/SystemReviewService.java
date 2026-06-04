package com.receitasapi.api.service;

import java.util.List;

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
                .rating(request.getRating())
                .comment(request.getComment())
                .user(user)
                .build();

        return systemReviewRepository.save(review);
    }

    public List<SystemReview> listMyReviews(String username) {
        return systemReviewRepository.findByUserUsernameOrderByIdDesc(username);
    }

    public SystemReview getReview(Long id) {
        return systemReviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review nao encontrada"));
    }

    public SystemReview updateReview(Long id, SystemReviewRequest request, String username) {
        SystemReview review = getReview(id);
        validateOwner(review, username);

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return systemReviewRepository.save(review);
    }

    public void deleteReview(Long id, String username, boolean isAdmin) {
        SystemReview review = getReview(id);
        if (!isAdmin) {
            validateOwner(review, username);
        }
        systemReviewRepository.delete(review);
    }

    private void validateOwner(SystemReview review, String username) {
        if (!review.getUser().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao e dono do review");
        }
    }
}

