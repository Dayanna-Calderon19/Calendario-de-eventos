package com.example.proyecto_calendario_de_eventos.service.impl;

import com.example.proyecto_calendario_de_eventos.dto.request.CrearCategoriaRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.CategoriaResponse;
import com.example.proyecto_calendario_de_eventos.entity.Categoria;
import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import com.example.proyecto_calendario_de_eventos.exception.ConflictoRecursoException;
import com.example.proyecto_calendario_de_eventos.exception.RecursoNoEncontradoException;
import com.example.proyecto_calendario_de_eventos.mapper.CategoriaMapper;
import com.example.proyecto_calendario_de_eventos.repository.CategoriaRepository;
import com.example.proyecto_calendario_de_eventos.repository.UsuarioRepository;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {

	private final CategoriaRepository categoriaRepository;
	private final UsuarioRepository usuarioRepository;
	private final CategoriaMapper categoriaMapper;

	@Override
	@Transactional(readOnly = true)
	public List<CategoriaResponse> listarCategorias(UsuarioAutenticado usuarioActual) {
		return categoriaRepository.findByUsuarioIdOrderByNombreAsc(usuarioActual.getId())
				.stream()
				.map(categoriaMapper::aRespuesta)
				.toList();
	}

	@Override
	@Transactional
	public CategoriaResponse crearCategoria(CrearCategoriaRequest solicitud, UsuarioAutenticado usuarioActual) {
		String nombreNormalizado = solicitud.nombre().trim();
		if (categoriaRepository.existsByUsuarioIdAndNombreIgnoreCase(usuarioActual.getId(), nombreNormalizado)) {
			throw new ConflictoRecursoException("Ya existe una categoría con el nombre \"" + nombreNormalizado + "\".");
		}

		Usuario usuario = usuarioRepository.findById(usuarioActual.getId())
				.orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));

		Categoria categoria = new Categoria();
		categoria.setUsuario(usuario);
		categoria.setNombre(nombreNormalizado);
		categoria.setColor(solicitud.color().trim().toUpperCase());

		return categoriaMapper.aRespuesta(categoriaRepository.save(categoria));
	}

	@Override
	@Transactional
	public CategoriaResponse actualizarCategoria(UUID id, CrearCategoriaRequest solicitud, UsuarioAutenticado usuarioActual) {
		Categoria categoria = categoriaRepository.findByIdAndUsuarioId(id, usuarioActual.getId())
				.orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada."));

		String nombreNormalizado = solicitud.nombre().trim();
		if (!categoria.getNombre().equalsIgnoreCase(nombreNormalizado)
				&& categoriaRepository.existsByUsuarioIdAndNombreIgnoreCase(usuarioActual.getId(), nombreNormalizado)) {
			throw new ConflictoRecursoException("Ya existe una categoría con el nombre \"" + nombreNormalizado + "\".");
		}

		categoria.setNombre(nombreNormalizado);
		categoria.setColor(solicitud.color().trim().toUpperCase());

		return categoriaMapper.aRespuesta(categoriaRepository.save(categoria));
	}

	@Override
	@Transactional
	public void eliminarCategoria(UUID id, UsuarioAutenticado usuarioActual) {
		Categoria categoria = categoriaRepository.findByIdAndUsuarioId(id, usuarioActual.getId())
				.orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada."));
		categoriaRepository.delete(categoria);
	}
}
