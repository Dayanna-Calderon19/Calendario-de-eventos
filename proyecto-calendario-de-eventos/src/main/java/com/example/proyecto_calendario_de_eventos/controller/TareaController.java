package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CambiarEstadoTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.TareaResponse;
import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.enums.PrioridadTarea;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.TareaService;
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

@Tag(name = "Tareas", description = "Consulta y gestión de tareas del usuario")
@RestController
@RequestMapping("/api/tareas")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TareaController {

	private final TareaService tareaService;

	@Operation(summary = "Listar tareas del usuario con búsqueda y filtros opcionales")
	@GetMapping
	public ResponseEntity<List<TareaResponse>> listarTareas(
			@RequestParam(required = false) String busqueda,
			@RequestParam(required = false) EstadoTarea estado,
			@RequestParam(required = false) PrioridadTarea prioridad,
			@RequestParam(required = false) UUID categoriaId,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime desde,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime hasta,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(tareaService.listarTareas(
				busqueda,
				estado,
				prioridad,
				categoriaId,
				desde != null ? desde.toInstant() : null,
				hasta != null ? hasta.toInstant() : null,
				usuarioActual
		));
	}

	@Operation(summary = "Consultar detalle de una tarea")
	@GetMapping("/{id}")
	public ResponseEntity<TareaResponse> obtenerTarea(
			@PathVariable UUID id,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(tareaService.obtenerTarea(id, usuarioActual));
	}

	@Operation(summary = "Crear una nueva tarea")
	@PostMapping
	public ResponseEntity<TareaResponse> crearTarea(
			@Valid @RequestBody CrearTareaRequest solicitud,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(tareaService.crearTarea(solicitud, usuarioActual));
	}

	@Operation(summary = "Actualizar una tarea existente")
	@PutMapping("/{id}")
	public ResponseEntity<TareaResponse> actualizarTarea(
			@PathVariable UUID id,
			@Valid @RequestBody ActualizarTareaRequest solicitud,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(tareaService.actualizarTarea(id, solicitud, usuarioActual));
	}

	@Operation(summary = "Cambiar estado y progreso de una tarea")
	@PatchMapping("/{id}/estado")
	public ResponseEntity<TareaResponse> cambiarEstado(
			@PathVariable UUID id,
			@Valid @RequestBody CambiarEstadoTareaRequest solicitud,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(tareaService.cambiarEstado(id, solicitud, usuarioActual));
	}

	@Operation(summary = "Eliminar una tarea")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarTarea(
			@PathVariable UUID id,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		tareaService.eliminarTarea(id, usuarioActual);
		return ResponseEntity.noContent().build();
	}
}
