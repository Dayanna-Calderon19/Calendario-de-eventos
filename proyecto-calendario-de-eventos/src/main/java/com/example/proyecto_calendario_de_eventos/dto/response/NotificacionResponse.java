package com.example.proyecto_calendario_de_eventos.dto.response;

import java.time.Instant;
import java.util.UUID;

public record NotificacionResponse(
		UUID id,
		UUID recordatorioId,
		String titulo,
		String mensaje,
		boolean leida,
		Instant fechaLectura,
		Instant fechaCreacion
) {
}
