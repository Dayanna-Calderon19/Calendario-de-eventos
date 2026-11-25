package com.example.proyecto_calendario_de_eventos.dto.request;

import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CambiarEstadoTareaRequest(
		@NotNull(message = "El estado de la tarea es obligatorio.")
		EstadoTarea estado,

		@Min(value = 0, message = "El progreso mínimo es 0%.")
		@Max(value = 100, message = "El progreso máximo es 100%.")
		Integer porcentajeProgreso
) {
}
