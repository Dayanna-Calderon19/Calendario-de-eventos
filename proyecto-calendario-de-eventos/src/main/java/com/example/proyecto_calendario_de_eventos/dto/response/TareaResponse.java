package com.example.proyecto_calendario_de_eventos.dto.response;

import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.enums.PrioridadTarea;

import java.time.Instant;
import java.util.UUID;

public record TareaResponse(
		UUID id,
		String titulo,
		String descripcion,
		PrioridadTarea prioridad,
		EstadoTarea estado,
		int porcentajeProgreso,
		Instant fechaLimite,
		Instant fechaCompletada,
		UUID eventoId,
		UUID categoriaId,
		boolean vencida,
		Instant fechaCreacion,
		Instant fechaActualizacion
) {
}
