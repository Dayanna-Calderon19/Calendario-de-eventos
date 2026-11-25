package com.example.proyecto_calendario_de_eventos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActualizarPerfilRequest(
		@NotBlank(message = "Los nombres son obligatorios.")
		@Size(min = 2, max = 100, message = "Los nombres deben tener entre 2 y 100 caracteres.")
		String nombres,

		@NotBlank(message = "Los apellidos son obligatorios.")
		@Size(min = 2, max = 100, message = "Los apellidos deben tener entre 2 y 100 caracteres.")
		String apellidos
) {
}
