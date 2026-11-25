package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.response.NotificacionResponse;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.NotificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Notificaciones", description = "Historial y gestión de notificaciones de la aplicación")
@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class NotificacionController {

	private final NotificacionService notificacionService;

	@Operation(summary = "Listar historial de notificaciones del usuario")
	@GetMapping
	public ResponseEntity<List<NotificacionResponse>> listarNotificaciones(
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(notificacionService.listarNotificaciones(usuarioActual));
	}

	@Operation(summary = "Contar notificaciones no leídas")
	@GetMapping("/no-leidas/cantidad")
	public ResponseEntity<Map<String, Long>> contarNoLeidas(
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(Map.of("cantidad", notificacionService.contarNoLeidas(usuarioActual)));
	}

	@Operation(summary = "Marcar una notificación como leída")
	@PatchMapping("/{id}/leida")
	public ResponseEntity<NotificacionResponse> marcarComoLeida(
			@PathVariable UUID id,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(notificacionService.marcarComoLeida(id, usuarioActual));
	}

	@Operation(summary = "Marcar todas las notificaciones del usuario como leídas")
	@PatchMapping("/leer-todas")
	public ResponseEntity<Void> marcarTodasComoLeidas(
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		notificacionService.marcarTodasComoLeidas(usuarioActual);
		return ResponseEntity.noContent().build();
	}

	@Operation(summary = "Eliminar una notificación")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarNotificacion(
			@PathVariable UUID id,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		notificacionService.eliminarNotificacion(id, usuarioActual);
		return ResponseEntity.noContent().build();
	}
}
