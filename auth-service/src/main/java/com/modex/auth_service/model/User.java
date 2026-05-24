// ============================================================
// User.java - Model de usuario en el Auth Service
// Representa un usuario en la base de datos del Auth Service.
//
// IMPORTANTE: Este modelo es diferente al User del User Service.
// El Auth Service solo necesita los campos necesarios para
// autenticar — email, password y si esta activo.
//
// Ambos servicios comparten la misma coleccion "users" en
// MongoDB pero cada uno solo usa los campos que necesita.
// ============================================================

package com.modex.auth_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Field("full_name")
    private String fullName;

    @Indexed(unique = true)
    private String email;

    @Field("password")
    private String password;

    @Field("shipping_address")
    private String shippingAddress;

    @Field("phone_number")
    private String phoneNumber;

    @Field("city")
    private String city;

    @Field("country")
    private String country;

    // Rol del usuario — ADMIN o CLIENTE
    // Se guarda en MongoDB y se incluye en el JWT
    @Builder.Default
    @Field("role")
    private String role = "CLIENTE";

    @Builder.Default
    @Field("active")
    private Boolean active = true;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
}