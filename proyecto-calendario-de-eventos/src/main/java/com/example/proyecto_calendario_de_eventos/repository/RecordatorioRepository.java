package com.example.proyecto_calendario_de_eventos.repository;

import com.example.proyecto_calendario_de_eventos.entity.Recordatorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecordatorioRepository extends JpaRepository<Recordatorio, UUID> {

	@Query("""
			SELECT r FROM Recordatorio r
			WHERE r.usuario.id = :usuarioId
			  AND (:eventoId IS NULL OR r.eventoId = :eventoId)
			  AND (:tareaId IS NULL OR r.tareaId = :tareaId)
			ORDER BY r.fechaActivacion ASC
			""")
	List<Recordatorio> buscarPorUsuario(
			@Param("usuarioId") UUID usuarioId,
			@Param("eventoId") UUID eventoId,
			@Param("tareaId") UUID tareaId
	);

	Optional<Recordatorio> findByIdAndUsuarioId(UUID id, UUID usuarioId);

	boolean existsByUsuarioIdAndEventoIdAndMinutosAnticipacionAndCanal(
			UUID usuarioId, UUID eventoId, Integer minutosAnticipacion, String canal
	);

	boolean existsByUsuarioIdAndTareaIdAndMinutosAnticipacionAndCanal(
			UUID usuarioId, UUID tareaId, Integer minutosAnticipacion, String canal
	);

	List<Recordatorio> findByProcesadoFalseAndFechaActivacionLessThanEqual(Instant limite);

	void deleteByEventoId(UUID eventoId);

	void deleteByTareaId(UUID tareaId);
}
