package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.ReprogramarEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.EventoResponse;
import com.example.proyecto_calendario_de_eventos.enums.TipoEvento;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.EventoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Tag(name = "Eventos", description = "Gestión y consulta de eventos del calendario")
@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class EventoController {

	private final EventoService eventoService;

	@Operation(summary = "Consultar eventos del calendario en un rango de fechas")
	@GetMapping("/calendario")
	public ResponseEntity<List<EventoResponse>> obtenerEventosCalendario(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime inicio,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fin,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(
				eventoService.obtenerEventosCalendario(inicio.toInstant(), fin.toInstant(), usuarioActual)
		);
	}

	@Operation(summary = "Listar y filtrar eventos del usuario")
	@GetMapping
	public ResponseEntity<List<EventoResponse>> listarEventos(
			@RequestParam(required = false) String busqueda,
			@RequestParam(required = false) TipoEvento tipo,
			@RequestParam(required = false) UUID categoriaId,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime desde,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime hasta,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(eventoService.listarEventos(
				busqueda,
				tipo,
				categoriaId,
				desde != null ? desde.toInstant() : null,
				hasta != null ? hasta.toInstant() : null,
				usuarioActual
		));
	}

	@Operation(summary = "Consultar detalle de un evento")
	@GetMapping("/{id}")
	public ResponseEntity<EventoResponse> obtenerEvento(
			@PathVariable UUID id,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(eventoService.obtenerEvento(id, usuarioActual));
	}

	@Operation(summary = "Crear un nuevo evento")
	@PostMapping
	public ResponseEntity<EventoResponse> crearEvento(
			@Valid @RequestBody CrearEventoRequest solicitud,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(eventoService.crearEvento(solicitud, usuarioActual));
	}

	@Operation(summary = "Actualizar un evento existente")
	@PutMapping("/{id}")
	public ResponseEntity<EventoResponse> actualizarEvento(
			@PathVariable UUID id,
			@Valid @RequestBody ActualizarEventoRequest solicitud,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(eventoService.actualizarEvento(id, solicitud, usuarioActual));
	}

	@Operation(summary = "Reprogramar fechas de un evento")
	@PatchMapping("/{id}/reprogramar")
	public ResponseEntity<EventoResponse> reprogramarEvento(
			@PathVariable UUID id,
			@Valid @RequestBody ReprogramarEventoRequest solicitud,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(eventoService.reprogramarEvento(id, solicitud, usuarioActual));
	}

	@Operation(summary = "Eliminar un evento")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarEvento(
			@PathVariable UUID id,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		eventoService.eliminarEvento(id, usuarioActual);
		return ResponseEntity.noContent().build();
	}
}
