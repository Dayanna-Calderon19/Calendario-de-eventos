package com.example.proyecto_calendario_de_eventos.exception;

import java.time.Instant;
import java.util.Map;

public record ErrorApiResponse(
		Instant marcaTiempo,
		int codigo,
		String error,
		String mensaje,
		String ruta,
		Map<String, String> detalles
) {
}
