package com.example.proyecto_calendario_de_eventos.dto.request;

import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.enums.PrioridadTarea;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record ActualizarTareaRequest(
		@NotBlank(message = "El título de la tarea es obligatorio.")
		@Size(min = 2, max = 150, message = "El título debe tener entre 2 y 150 caracteres.")
		String titulo,

		@Size(max = 1000, message = "La descripción no debe superar los 1000 caracteres.")
		String descripcion,

		@NotNull(message = "La prioridad es obligatoria.")
		PrioridadTarea prioridad,

		@NotNull(message = "El estado es obligatorio.")
		EstadoTarea estado,

		@Min(value = 0, message = "El progreso mínimo es 0%.")
		@Max(value = 100, message = "El progreso máximo es 100%.")
		Integer porcentajeProgreso,

		Instant fechaLimite,

		UUID eventoId,

		UUID categoriaId
) {
}
