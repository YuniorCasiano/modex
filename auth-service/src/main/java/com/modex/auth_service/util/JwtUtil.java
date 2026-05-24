// ============================================================
// JwtUtil.java - Utilidad para generar y validar JWT
// ============================================================

package com.modex.auth_service.util;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretString;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(
                secretString.getBytes(StandardCharsets.UTF_8)
        );
    }

    // Genera JWT con email y rol incluido como claim
    public String generateAccessToken(String email, String role) {
        Date now        = new Date(System.currentTimeMillis());
        Date expiration = new Date(System.currentTimeMillis() + jwtExpiration);
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(getSecretKey())
                .compact();
    }

    // Genera refresh token aleatorio (UUID)
    public String generateRefreshToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    // Extrae el email del subject del JWT
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Verifica firma, email y expiracion
    public boolean isTokenValid(String token, String email) {
        try {
            String tokenEmail = extractEmail(token);
            return tokenEmail.equals(email) && !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            log.debug("Token expirado para email: {}", email);
            return false;
        } catch (MalformedJwtException e) {
            log.warn("Token malformado recibido");
            return false;
        } catch (UnsupportedJwtException e) {
            log.warn("Token no soportado recibido");
            return false;
        } catch (Exception e) {
            log.error("Error validando token: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }

    public Long getRefreshExpirationMs() {
        return refreshExpiration;
    }

    public Long getAccessExpirationMs() {
        return jwtExpiration;
    }
}