package com.example.proyecto_calendario_de_eventos.dto.response;

import java.time.Instant;
import java.util.UUID;

public record RecordatorioResponse(
		UUID id,
		UUID eventoId,
		UUID tareaId,
		Integer minutosAnticipacion,
		Instant fechaActivacion,
		String canal,
		boolean procesado,
		String tituloReferencia
) {
}
