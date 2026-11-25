package com.example.proyecto_calendario_de_eventos.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record ReprogramarEventoRequest(
		@NotNull(message = "La nueva fecha de inicio es obligatoria.")
		Instant fechaInicio,

		@NotNull(message = "La nueva fecha de finalización es obligatoria.")
		Instant fechaFin,

		Boolean diaCompleto
) {
}
