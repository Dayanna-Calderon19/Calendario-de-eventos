package com.example.proyecto_calendario_de_eventos.service;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CambiarEstadoTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.TareaResponse;
import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.enums.PrioridadTarea;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TareaService {

	List<TareaResponse> listarTareas(
			String busqueda,
			EstadoTarea estado,
			PrioridadTarea prioridad,
			UUID categoriaId,
			Instant desde,
			Instant hasta,
			UsuarioAutenticado usuarioActual
	);

	TareaResponse obtenerTarea(UUID id, UsuarioAutenticado usuarioActual);

	TareaResponse crearTarea(CrearTareaRequest solicitud, UsuarioAutenticado usuarioActual);

	TareaResponse actualizarTarea(UUID id, ActualizarTareaRequest solicitud, UsuarioAutenticado usuarioActual);

	TareaResponse cambiarEstado(UUID id, CambiarEstadoTareaRequest solicitud, UsuarioAutenticado usuarioActual);

	void eliminarTarea(UUID id, UsuarioAutenticado usuarioActual);
}
