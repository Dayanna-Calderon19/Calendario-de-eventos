package com.example.proyecto_calendario_de_eventos.service;

import com.example.proyecto_calendario_de_eventos.dto.request.CrearRecordatorioRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.RecordatorioResponse;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;

import java.util.List;
import java.util.UUID;

public interface RecordatorioService {

	List<RecordatorioResponse> listarRecordatorios(UUID eventoId, UUID tareaId, UsuarioAutenticado usuarioActual);

	RecordatorioResponse crearRecordatorio(CrearRecordatorioRequest solicitud, UsuarioAutenticado usuarioActual);

	void eliminarRecordatorio(UUID id, UsuarioAutenticado usuarioActual);
}
