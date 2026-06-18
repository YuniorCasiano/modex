package com.modex.auth_service.dto;

import java.time.LocalDateTime;

public record UserResponseDTO(
        String id,
        String fullName,
        String email,
        String city,
        String country,
        String role,
        Boolean active,
        LocalDateTime createdAt
) {}