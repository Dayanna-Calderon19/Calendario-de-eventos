package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.CrearCategoriaRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.CategoriaResponse;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.CategoriaService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Categorías", description = "Gestión de categorías personalizadas para eventos y tareas")
@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class CategoriaController {

	private final CategoriaService categoriaService;

	@Operation(summary = "Listar categorías del usuario")
	@GetMapping
	public ResponseEntity<List<CategoriaResponse>> listarCategorias(
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(categoriaService.listarCategorias(usuarioActual));
	}

	@Operation(summary = "Crear una nueva categoría")
	@PostMapping
	public ResponseEntity<CategoriaResponse> crearCategoria(
			@Valid @RequestBody CrearCategoriaRequest solicitud,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(categoriaService.crearCategoria(solicitud, usuarioActual));
	}

	@Operation(summary = "Actualizar una categoría existente")
	@PutMapping("/{id}")
	public ResponseEntity<CategoriaResponse> actualizarCategoria(
			@PathVariable UUID id,
			@Valid @RequestBody CrearCategoriaRequest solicitud,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		return ResponseEntity.ok(categoriaService.actualizarCategoria(id, solicitud, usuarioActual));
	}

	@Operation(summary = "Eliminar una categoría")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarCategoria(
			@PathVariable UUID id,
			@AuthenticationPrincipal UsuarioAutenticado usuarioActual
	) {
		categoriaService.eliminarCategoria(id, usuarioActual);
		return ResponseEntity.noContent().build();
	}
}
