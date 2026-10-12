package com.krishisathi.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.krishisathi.model.Role;

import io.jsonwebtoken.Jwts;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(
            SecretKey jwtSecretKey,
            @Value("${jwt.expiration}") long expiration) {

        this.secretKey = jwtSecretKey;
        this.expiration = expiration;
    }

    public String generateToken(String email, Role role) {

        Date now = new Date();

        return Jwts.builder()
                .subject(email)
                .claim("role", role.name())
                .issuedAt(now)
                .expiration(
                        new Date(now.getTime() + expiration)
                )
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }
}