package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.CrearRecordatorioRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.RecordatorioResponse;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.RecordatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Recordatorios", description = "Configuración y consulta de recordatorios de eventos y tareas")
@RestController
@RequestMapping("/api/recordatorios")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class RecordatorioController {

	private final RecordatorioService recordatorioService;

	@Operation(summary = "Listar recordatorios del usuario, opcionalmente filtrados por evento o tarea")
	@GetMapping
	public ResponseEntity<List<RecordatorioResponse>> listarRecordatorios(
			@RequestParam(required = false) UUID eventoId,
			@RequestParam(required = false) UUID tareaId,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(recordatorioService.listarRecordatorios(eventoId, tareaId, usuarioActual));
	}

	@Operation(summary = "Crear un nuevo recordatorio para un evento o tarea")
	@PostMapping
	public ResponseEntity<RecordatorioResponse> crearRecordatorio(
			@Valid @RequestBody CrearRecordatorioRequest solicitud,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(recordatorioService.crearRecordatorio(solicitud, usuarioActual));
	}

	@Operation(summary = "Eliminar un recordatorio")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarRecordatorio(
			@PathVariable UUID id,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		recordatorioService.eliminarRecordatorio(id, usuarioActual);
		return ResponseEntity.noContent().build();
	}
}
