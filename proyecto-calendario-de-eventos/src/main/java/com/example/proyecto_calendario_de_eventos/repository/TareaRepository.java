package com.example.proyecto_calendario_de_eventos.repository;

import com.example.proyecto_calendario_de_eventos.entity.Tarea;
import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.enums.PrioridadTarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TareaRepository extends JpaRepository<Tarea, UUID>, JpaSpecificationExecutor<Tarea> {

	@Query("""
			SELECT t FROM Tarea t
			WHERE t.usuario.id = :usuarioId
			  AND (:estado IS NULL OR t.estado = :estado)
			  AND (:prioridad IS NULL OR t.prioridad = :prioridad)
			ORDER BY t.fechaLimite ASC NULLS LAST, t.fechaCreacion DESC
			""")
	List<Tarea> buscarPorUsuario(
			@Param("usuarioId") UUID usuarioId,
			@Param("estado") EstadoTarea estado,
			@Param("prioridad") PrioridadTarea prioridad
	);

	Optional<Tarea> findByIdAndUsuarioId(UUID id, UUID usuarioId);
}
