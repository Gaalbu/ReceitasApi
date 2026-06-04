package com.receitasapi.api.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.receitasapi.api.dto.AuthResponse;
import com.receitasapi.api.dto.LoginRequest;
import com.receitasapi.api.dto.RegisterRequest;
import com.receitasapi.api.model.User;
import com.receitasapi.api.repository.UserRepository;
import com.receitasapi.api.security.JwtService;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        User existing = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getEmail()))
                .orElse(null);

        if (existing != null) {
            if (!passwordEncoder.matches(request.getPassword(), existing.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username ja existe");
            }

            String token = jwtService.generateToken(existing);
            return AuthResponse.builder()
                    .token(token)
                    .username(existing.getUsername())
                    .email(existing.getEmail())
                    .build();
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);

        return AuthResponse.builder()
                .token(token)
                .username(saved.getUsername())
                .email(saved.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas"));

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
}

