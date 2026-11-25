package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarConfiguracionRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarPerfilRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.ConfiguracionUsuarioResponse;
import com.example.proyecto_calendario_de_eventos.dto.response.UsuarioResponse;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Usuarios", description = "Perfil del usuario autenticado")
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Operation(summary = "Consultar perfil del usuario autenticado")
    @GetMapping("/perfil")
    public ResponseEntity<UsuarioResponse> obtenerPerfil(
            @AuthenticationPrincipal UsuarioAutenticado usuarioActual) {
        return ResponseEntity.ok(usuarioService.obtenerPerfil(usuarioActual));
    }

    @Operation(summary = "Actualizar datos editables del perfil")
    @PutMapping("/perfil")
    public ResponseEntity<UsuarioResponse> actualizarPerfil(
            @Valid @RequestBody ActualizarPerfilRequest solicitud,
            @AuthenticationPrincipal UsuarioAutenticado usuarioActual) {
        return ResponseEntity.ok(usuarioService.actualizarPerfil(solicitud, usuarioActual));
    }

    @Operation(summary = "Consultar configuración del usuario autenticado")
    @GetMapping("/configuracion")
    public ResponseEntity<ConfiguracionUsuarioResponse> obtenerConfiguracion(
            @AuthenticationPrincipal UsuarioAutenticado usuarioActual) {
        return ResponseEntity.ok(usuarioService.obtenerConfiguracion(usuarioActual));
    }

    @Operation(summary = "Actualizar configuración del usuario autenticado")
    @PutMapping("/configuracion")
    public ResponseEntity<ConfiguracionUsuarioResponse> actualizarConfiguracion(
            @Valid @RequestBody ActualizarConfiguracionRequest solicitud,
            @AuthenticationPrincipal UsuarioAutenticado usuarioActual) {
        return ResponseEntity.ok(usuarioService.actualizarConfiguracion(solicitud, usuarioActual));
    }

    @Operation(summary = "Eliminar la cuenta y todos los datos asociados del usuario autenticado")
    @DeleteMapping("/cuenta")
    public ResponseEntity<Void> eliminarCuenta(
            @AuthenticationPrincipal UsuarioAutenticado usuarioActual) {
        usuarioService.eliminarCuenta(usuarioActual);
        return ResponseEntity.noContent().build();
    }
}
