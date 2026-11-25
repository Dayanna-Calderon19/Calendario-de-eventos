package com.example.proyecto_calendario_de_eventos.service;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarConfiguracionRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarPerfilRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.ConfiguracionUsuarioResponse;
import com.example.proyecto_calendario_de_eventos.dto.response.UsuarioResponse;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;

public interface UsuarioService {

    UsuarioResponse obtenerPerfil(UsuarioAutenticado usuarioActual);

    UsuarioResponse actualizarPerfil(ActualizarPerfilRequest solicitud, UsuarioAutenticado usuarioActual);

    ConfiguracionUsuarioResponse obtenerConfiguracion(UsuarioAutenticado usuarioActual);

    ConfiguracionUsuarioResponse actualizarConfiguracion(ActualizarConfiguracionRequest solicitud, UsuarioAutenticado usuarioActual);

    void eliminarCuenta(UsuarioAutenticado usuarioActual);
}
