package com.example.proyecto_calendario_de_eventos.dto.response;

import java.util.UUID;

public record CategoriaResponse(
		UUID id,
		String nombre,
		String color
) {
}
