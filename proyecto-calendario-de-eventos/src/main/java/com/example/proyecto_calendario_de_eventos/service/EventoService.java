package com.example.proyecto_calendario_de_eventos.service;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.ReprogramarEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.EventoResponse;
import com.example.proyecto_calendario_de_eventos.enums.TipoEvento;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface EventoService {

	List<EventoResponse> obtenerEventosCalendario(Instant inicio, Instant fin, UsuarioAutenticado usuarioActual);

	List<EventoResponse> listarEventos(
			String busqueda,
			TipoEvento tipo,
			UUID categoriaId,
			Instant desde,
			Instant hasta,
			UsuarioAutenticado usuarioActual
	);

	EventoResponse obtenerEvento(UUID id, UsuarioAutenticado usuarioActual);

	EventoResponse crearEvento(CrearEventoRequest solicitud, UsuarioAutenticado usuarioActual);

	EventoResponse actualizarEvento(UUID id, ActualizarEventoRequest solicitud, UsuarioAutenticado usuarioActual);

	EventoResponse reprogramarEvento(UUID id, ReprogramarEventoRequest solicitud, UsuarioAutenticado usuarioActual);

	void eliminarEvento(UUID id, UsuarioAutenticado usuarioActual);
}
