package com.example.proyecto_calendario_de_eventos.service;

import com.example.proyecto_calendario_de_eventos.dto.response.NotificacionResponse;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;

import java.util.List;
import java.util.UUID;

public interface NotificacionService {

	List<NotificacionResponse> listarNotificaciones(UsuarioAutenticado usuarioActual);

	long contarNoLeidas(UsuarioAutenticado usuarioActual);

	NotificacionResponse marcarComoLeida(UUID id, UsuarioAutenticado usuarioActual);

	void marcarTodasComoLeidas(UsuarioAutenticado usuarioActual);

	void eliminarNotificacion(UUID id, UsuarioAutenticado usuarioActual);
}
