package com.example.proyecto_calendario_de_eventos.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CrearRecordatorioRequest(
		UUID eventoId,
		UUID tareaId,
		@NotNull(message = "La anticipación del recordatorio es obligatoria.")
		@Min(value = 0, message = "La anticipación no puede ser negativa.")
		@Max(value = 43200, message = "La anticipación máxima permitida es de 30 días (43200 minutos).")
		Integer minutosAnticipacion,
		@Size(max = 30, message = "El canal no debe superar los 30 caracteres.")
		String canal
) {
}
