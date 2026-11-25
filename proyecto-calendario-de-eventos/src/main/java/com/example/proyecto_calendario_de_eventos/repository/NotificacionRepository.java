package com.example.proyecto_calendario_de_eventos.repository;

import com.example.proyecto_calendario_de_eventos.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificacionRepository extends JpaRepository<Notificacion, UUID> {

	List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(UUID usuarioId);

	Optional<Notificacion> findByIdAndUsuarioId(UUID id, UUID usuarioId);

	long countByUsuarioIdAndLeidaFalse(UUID usuarioId);
}
