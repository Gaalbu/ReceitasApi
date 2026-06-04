package com.receitasapi.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.SystemReviewRequest;
import com.receitasapi.api.model.SystemReview;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.SystemReviewRepository;
import com.receitasapi.api.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SystemReviewServiceTest {

    @Mock
    private SystemReviewRepository systemReviewRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SystemReviewService systemReviewService;

    @Test
    void createReviewSavesReview() {
        User user = User.builder().id(1L).username("maria").build();
        SystemReviewRequest request = new SystemReviewRequest(5, "Muito bom");

        when(userRepository.findByUsername("maria")).thenReturn(Optional.of(user));
        when(systemReviewRepository.save(any(SystemReview.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SystemReview review = systemReviewService.createReview(request, "maria");

        assertEquals(5, review.getRating());
        assertEquals("Muito bom", review.getComment());
        assertEquals(user, review.getUser());
        verify(systemReviewRepository).save(any(SystemReview.class));
    }

    @Test
    void createReviewThrowsWhenUserMissing() {
        when(userRepository.findByUsername("maria")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> systemReviewService.createReview(new SystemReviewRequest(5, "Muito bom"), "maria"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void listMyReviewsReturnsOrderedReviews() {
        when(systemReviewRepository.findByUserUsernameOrderByIdDesc("maria")).thenReturn(List.of());

        assertEquals(0, systemReviewService.listMyReviews("maria").size());
    }

    @Test
    void getReviewThrowsWhenMissing() {
        when(systemReviewRepository.findById(10L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> systemReviewService.getReview(10L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void updateReviewUpdatesRatingAndCommentForOwner() {
        User user = User.builder().id(1L).username("maria").build();
        SystemReview review = SystemReview.builder().id(10L).rating(3).comment("ok").user(user).build();
        when(systemReviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(systemReviewRepository.save(any(SystemReview.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SystemReview result = systemReviewService.updateReview(10L, new SystemReviewRequest(5, "melhor"), "maria");

        assertEquals(5, result.getRating());
        assertEquals("melhor", result.getComment());
    }

    @Test
    void updateReviewRejectsNonOwner() {
        User user = User.builder().id(1L).username("joao").build();
        SystemReview review = SystemReview.builder().id(10L).rating(3).comment("ok").user(user).build();
        when(systemReviewRepository.findById(10L)).thenReturn(Optional.of(review));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> systemReviewService.updateReview(10L, new SystemReviewRequest(5, "melhor"), "maria"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(systemReviewRepository, never()).save(any());
    }

    @Test
    void deleteReviewAllowsOwner() {
        User user = User.builder().id(1L).username("maria").build();
        SystemReview review = SystemReview.builder().id(10L).rating(3).comment("ok").user(user).build();
        when(systemReviewRepository.findById(10L)).thenReturn(Optional.of(review));

        systemReviewService.deleteReview(10L, "maria", false);

        verify(systemReviewRepository).delete(review);
    }

    @Test
    void deleteReviewAllowsAdmin() {
        User user = User.builder().id(1L).username("joao").build();
        SystemReview review = SystemReview.builder().id(10L).rating(3).comment("ok").user(user).build();
        when(systemReviewRepository.findById(10L)).thenReturn(Optional.of(review));

        systemReviewService.deleteReview(10L, "admin", true);

        verify(systemReviewRepository).delete(review);
    }

    @Test
    void deleteReviewRejectsNonOwnerNonAdmin() {
        User user = User.builder().id(1L).username("joao").build();
        SystemReview review = SystemReview.builder().id(10L).rating(3).comment("ok").user(user).build();
        when(systemReviewRepository.findById(10L)).thenReturn(Optional.of(review));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> systemReviewService.deleteReview(10L, "maria", false));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(systemReviewRepository, never()).delete(any());
    }
}
