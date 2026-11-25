package com.example.proyecto_calendario_de_eventos.dto.request;

import com.example.proyecto_calendario_de_eventos.enums.TipoEvento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record CrearEventoRequest(
		@NotBlank(message = "El título del evento es obligatorio.")
		@Size(min = 3, max = 150, message = "El título debe tener entre 3 y 150 caracteres.")
		String titulo,

		@Size(max = 1000, message = "La descripción no debe superar los 1000 caracteres.")
		String descripcion,

		@NotNull(message = "El tipo de evento es obligatorio.")
		TipoEvento tipo,

		@NotNull(message = "La fecha de inicio es obligatoria.")
		Instant fechaInicio,

		@NotNull(message = "La fecha de finalización es obligatoria.")
		Instant fechaFin,

		boolean diaCompleto,

		@Size(max = 60, message = "La zona horaria no debe superar los 60 caracteres.")
		String zonaHoraria,

		@Size(max = 200, message = "La ubicación no debe superar los 200 caracteres.")
		String ubicacion,

		@Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "El color debe tener formato hexadecimal válido, por ejemplo #4F46E5.")
		String color,

		UUID categoriaId
) {
}
