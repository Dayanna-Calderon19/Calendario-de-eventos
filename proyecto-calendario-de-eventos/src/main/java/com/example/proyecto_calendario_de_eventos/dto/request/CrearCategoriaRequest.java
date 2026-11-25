package com.example.proyecto_calendario_de_eventos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CrearCategoriaRequest(
		@NotBlank(message = "El nombre de la categoría es obligatorio.")
		@Size(min = 2, max = 80, message = "El nombre de la categoría debe tener entre 2 y 80 caracteres.")
		String nombre,

		@NotBlank(message = "El color de la categoría es obligatorio.")
		@Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "El color debe tener un formato hexadecimal válido, por ejemplo #4F46E5.")
		String color
) {
}
