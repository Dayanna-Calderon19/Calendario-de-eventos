package com.example.proyecto_calendario_de_eventos.service;

import com.example.proyecto_calendario_de_eventos.dto.request.CrearCategoriaRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.CategoriaResponse;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;

import java.util.List;
import java.util.UUID;

public interface CategoriaService {

	List<CategoriaResponse> listarCategorias(UsuarioAutenticado usuarioActual);

	CategoriaResponse crearCategoria(CrearCategoriaRequest solicitud, UsuarioAutenticado usuarioActual);

	CategoriaResponse actualizarCategoria(UUID id, CrearCategoriaRequest solicitud, UsuarioAutenticado usuarioActual);

	void eliminarCategoria(UUID id, UsuarioAutenticado usuarioActual);
}
