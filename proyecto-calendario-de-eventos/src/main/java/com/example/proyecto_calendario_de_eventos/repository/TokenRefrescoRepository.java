package com.example.proyecto_calendario_de_eventos.repository;

import com.example.proyecto_calendario_de_eventos.entity.TokenRefresco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface TokenRefrescoRepository extends JpaRepository<TokenRefresco, UUID> {

	Optional<TokenRefresco> findByTokenHash(String tokenHash);

	@Modifying
	@Query("UPDATE TokenRefresco t SET t.revocado = true WHERE t.usuario.id = :usuarioId AND t.revocado = false")
	void revocarActivosPorUsuario(@Param("usuarioId") UUID usuarioId);
}
