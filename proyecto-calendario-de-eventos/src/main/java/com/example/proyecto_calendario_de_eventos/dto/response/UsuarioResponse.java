package com.example.proyecto_calendario_de_eventos.dto.response;

import java.time.Instant;
import java.util.UUID;

public record UsuarioResponse(
		UUID id,
		String nombres,
		String apellidos,
		String correo,
		boolean activo,
		Instant fechaCreacion
) {
}
