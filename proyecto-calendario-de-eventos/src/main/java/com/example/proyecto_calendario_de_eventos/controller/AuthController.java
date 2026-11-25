package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.InicioSesionRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RecuperarContrasenaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RegistroUsuarioRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RestablecerContrasenaRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.AutenticacionResponse;
import com.example.proyecto_calendario_de_eventos.dto.response.MensajeResponse;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.AutenticacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Autenticación", description = "Registro, inicio y cierre de sesión, recuperación de contraseña")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AutenticacionService autenticacionService;

    @Operation(summary = "Registrar nueva cuenta")
    @PostMapping("/registro")
    public ResponseEntity<AutenticacionResponse> registrar(
            @Valid @RequestBody RegistroUsuarioRequest solicitud,
            HttpServletResponse respuesta) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(autenticacionService.registrar(solicitud, respuesta));
    }

    @Operation(summary = "Iniciar sesión")
    @PostMapping("/iniciar-sesion")
    public ResponseEntity<AutenticacionResponse> iniciarSesion(
            @Valid @RequestBody InicioSesionRequest solicitud,
            HttpServletResponse respuesta) {
        return ResponseEntity.ok(autenticacionService.iniciarSesion(solicitud, respuesta));
    }

    @Operation(summary = "Renovar token de acceso usando cookie de refresco")
    @PostMapping("/renovar")
    public ResponseEntity<AutenticacionResponse> renovarSesion(
            HttpServletRequest solicitud,
            HttpServletResponse respuesta) {
        return ResponseEntity.ok(autenticacionService.renovarSesion(solicitud, respuesta));
    }

    @Operation(summary = "Cerrar sesión e invalidar tokens", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/cerrar-sesion")
    public ResponseEntity<Void> cerrarSesion(
            HttpServletRequest solicitud,
            HttpServletResponse respuesta,
            @AuthenticationPrincipal UsuarioAutenticado usuarioActual) {
        autenticacionService.cerrarSesion(solicitud, respuesta, usuarioActual);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Solicitar recuperación de contraseña por correo")
    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<MensajeResponse> solicitarRecuperacion(
            @Valid @RequestBody RecuperarContrasenaRequest solicitud) {
        return ResponseEntity.ok(autenticacionService.solicitarRecuperacion(solicitud));
    }

    @Operation(summary = "Establecer nueva contraseña con token de recuperación")
    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<MensajeResponse> restablecerContrasena(
            @Valid @RequestBody RestablecerContrasenaRequest solicitud) {
        return ResponseEntity.ok(autenticacionService.restablecerContrasena(solicitud));
    }
}
