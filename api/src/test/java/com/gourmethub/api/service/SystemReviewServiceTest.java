package com.gourmethub.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.gourmethub.api.dto.SystemReviewRequest;
import com.gourmethub.api.model.SystemReview;
import com.gourmethub.api.model.User;
import com.gourmethub.api.repository.SystemReviewRepository;
import com.gourmethub.api.repository.UserRepository;

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
        SystemReviewRequest request = new SystemReviewRequest("Muito bom");

        when(userRepository.findByUsername("maria")).thenReturn(Optional.of(user));
        when(systemReviewRepository.save(any(SystemReview.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SystemReview review = systemReviewService.createReview(request, "maria");

        assertEquals("Muito bom", review.getComment());
        assertEquals(user, review.getUser());
        verify(systemReviewRepository).save(any(SystemReview.class));
    }

    @Test
    void createReviewThrowsWhenUserMissing() {
        when(userRepository.findByUsername("maria")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> systemReviewService.createReview(new SystemReviewRequest("Muito bom"), "maria"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
}
