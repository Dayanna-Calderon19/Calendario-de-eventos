package com.example.proyecto_calendario_de_eventos.dto.response;

public record AutenticacionResponse(
		String tokenAcceso,
		String tipoToken,
		long expiraEnMs,
		UsuarioResponse usuario
) {
}
