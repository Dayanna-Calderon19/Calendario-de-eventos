package com.example.proyecto_calendario_de_eventos.dto.response;

import com.example.proyecto_calendario_de_eventos.enums.TipoEvento;

import java.time.Instant;
import java.util.UUID;

public record EventoResponse(
		UUID id,
		String titulo,
		String descripcion,
		TipoEvento tipo,
		Instant fechaInicio,
		Instant fechaFin,
		boolean diaCompleto,
		String zonaHoraria,
		String ubicacion,
		String color,
		UUID categoriaId,
		Instant fechaCreacion,
		Instant fechaActualizacion
) {
}
