package com.example.proyecto_calendario_de_eventos.repository;

import com.example.proyecto_calendario_de_eventos.entity.TokenRecuperacionContrasena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface TokenRecuperacionContrasenaRepository extends JpaRepository<TokenRecuperacionContrasena, UUID> {

	Optional<TokenRecuperacionContrasena> findByTokenHash(String tokenHash);

	@Modifying
	@Query("UPDATE TokenRecuperacionContrasena t SET t.utilizado = true WHERE t.usuario.id = :usuarioId AND t.utilizado = false")
	void invalidarPendientesPorUsuario(@Param("usuarioId") UUID usuarioId);
}
