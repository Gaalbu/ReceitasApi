package com.receitasapi.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.AuthResponse;
import com.receitasapi.api.dto.LoginRequest;
import com.receitasapi.api.dto.RegisterRequest;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.UserRepository;
import com.receitasapi.api.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerCreatesUserAndReturnsToken() {
        RegisterRequest request = new RegisterRequest("ana", "ana@email.com", "senha123");

        when(passwordEncoder.encode("senha123")).thenReturn("encoded");

        User saved = User.builder()
                .id(1L)
                .username("ana")
                .email("ana@email.com")
                .password("encoded")
                .build();
        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(jwtService.generateToken(eq(saved))).thenReturn("token-123");

        AuthResponse response = authService.register(request);

        assertEquals("token-123", response.getToken());
        assertEquals("ana", response.getUsername());
        assertEquals("ana@email.com", response.getEmail());
        verify(userRepository).save(argThat(user -> "encoded".equals(user.getPassword())));
    }

    @Test
    void registerReturnsTokenWhenUsernameExistsAndPasswordMatches() {
        RegisterRequest request = new RegisterRequest("ana", "ana@email.com", "senha123");
        User existing = User.builder().id(1L).username("ana").email("ana@email.com").password("encoded").build();

        when(userRepository.findByUsername("ana")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("senha123", "encoded")).thenReturn(true);
        when(jwtService.generateToken(existing)).thenReturn("token-123");

        AuthResponse response = authService.register(request);

        assertEquals("token-123", response.getToken());
        assertEquals("ana", response.getUsername());
        assertEquals("ana@email.com", response.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerReturnsTokenWhenEmailExistsAndPasswordMatches() {
        RegisterRequest request = new RegisterRequest("ana", "ana@email.com", "senha123");
        User existing = User.builder().id(1L).username("ana").email("ana@email.com").password("encoded").build();

        when(userRepository.findByUsername("ana")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("ana@email.com")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("senha123", "encoded")).thenReturn(true);
        when(jwtService.generateToken(existing)).thenReturn("token-123");

        AuthResponse response = authService.register(request);

        assertEquals("token-123", response.getToken());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerThrowsWhenExistingUserPasswordDoesNotMatch() {
        RegisterRequest request = new RegisterRequest("ana", "ana@email.com", "senha123");
        User existing = User.builder().id(1L).username("ana").email("ana@email.com").password("encoded").build();

        when(userRepository.findByUsername("ana")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("senha123", "encoded")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> authService.register(request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginReturnsTokenWhenCredentialsAreValid() {
        LoginRequest request = new LoginRequest("ana", "senha123");
        User user = User.builder().id(1L).username("ana").email("ana@email.com").password("hash").build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("ana", "senha123"));
        when(userRepository.findByUsername("ana")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("token-abc");

        AuthResponse response = authService.login(request);

        assertEquals("token-abc", response.getToken());
        assertEquals("ana", response.getUsername());
        assertEquals("ana@email.com", response.getEmail());
    }

    @Test
    void loginThrowsWhenUserNotFound() {
        LoginRequest request = new LoginRequest("ana", "senha123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("ana", "senha123"));
        when(userRepository.findByUsername("ana")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> authService.login(request));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }
}
