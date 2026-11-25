package com.example.proyecto_calendario_de_eventos.service;

import com.example.proyecto_calendario_de_eventos.dto.request.InicioSesionRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RecuperarContrasenaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RegistroUsuarioRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RestablecerContrasenaRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.AutenticacionResponse;
import com.example.proyecto_calendario_de_eventos.dto.response.MensajeResponse;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AutenticacionService {

    AutenticacionResponse registrar(RegistroUsuarioRequest solicitud, HttpServletResponse respuesta);

    AutenticacionResponse iniciarSesion(InicioSesionRequest solicitud, HttpServletResponse respuesta);

    AutenticacionResponse renovarSesion(HttpServletRequest solicitud, HttpServletResponse respuesta);

    void cerrarSesion(HttpServletRequest solicitud, HttpServletResponse respuesta, UsuarioAutenticado usuarioActual);

    MensajeResponse solicitarRecuperacion(RecuperarContrasenaRequest solicitud);

    MensajeResponse restablecerContrasena(RestablecerContrasenaRequest solicitud);
}
