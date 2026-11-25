package com.example.proyecto_calendario_de_eventos.repository;

import com.example.proyecto_calendario_de_eventos.entity.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventoRepository extends JpaRepository<Evento, UUID>, JpaSpecificationExecutor<Evento> {

	@Query("""
			SELECT e FROM Evento e
			WHERE e.usuario.id = :usuarioId
			  AND e.eliminado = false
			  AND e.fechaInicio < :fin
			  AND e.fechaFin > :inicio
			ORDER BY e.fechaInicio ASC
			""")
	List<Evento> buscarPorUsuarioYRango(
			@Param("usuarioId") UUID usuarioId,
			@Param("inicio") Instant inicio,
			@Param("fin") Instant fin
	);

	@Query("""
			SELECT e FROM Evento e
			WHERE e.usuario.id = :usuarioId
			  AND e.eliminado = false
			  AND (:busqueda IS NULL
			       OR LOWER(e.titulo) LIKE LOWER(CONCAT('%', :busqueda, '%'))
			       OR LOWER(COALESCE(e.descripcion, '')) LIKE LOWER(CONCAT('%', :busqueda, '%')))
			ORDER BY e.fechaInicio ASC
			""")
	List<Evento> buscarPorUsuario(
			@Param("usuarioId") UUID usuarioId,
			@Param("busqueda") String busqueda
	);

	Optional<Evento> findByIdAndUsuarioIdAndEliminadoFalse(UUID id, UUID usuarioId);
}
