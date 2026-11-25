package com.example.proyecto_calendario_de_eventos.service.impl;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CambiarEstadoTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.TareaResponse;
import com.example.proyecto_calendario_de_eventos.entity.Tarea;
import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.enums.PrioridadTarea;
import com.example.proyecto_calendario_de_eventos.exception.RecursoNoEncontradoException;
import com.example.proyecto_calendario_de_eventos.exception.ReglaNegocioException;
import com.example.proyecto_calendario_de_eventos.mapper.TareaMapper;
import com.example.proyecto_calendario_de_eventos.repository.CategoriaRepository;
import com.example.proyecto_calendario_de_eventos.repository.TareaRepository;
import com.example.proyecto_calendario_de_eventos.repository.UsuarioRepository;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.TareaService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TareaServiceImpl implements TareaService {

	private final TareaRepository tareaRepository;
	private final CategoriaRepository categoriaRepository;
	private final UsuarioRepository usuarioRepository;
	private final TareaMapper tareaMapper;
	private final Clock reloj;

	@Override
	@Transactional(readOnly = true)
	public List<TareaResponse> listarTareas(
			String busqueda,
			EstadoTarea estado,
			PrioridadTarea prioridad,
			UUID categoriaId,
			Instant desde,
			Instant hasta,
			UsuarioAutenticado usuarioActual
	) {
		if (desde != null && hasta != null && hasta.isBefore(desde)) {
			throw new ReglaNegocioException("La fecha hasta debe ser igual o posterior a la fecha desde.");
		}

		String termino = (busqueda == null || busqueda.isBlank())
				? null
				: "%" + busqueda.trim().toLowerCase(Locale.ROOT) + "%";

		Specification<Tarea> especificacion = (root, query, cb) -> {
			List<Predicate> predicados = new ArrayList<>();
			predicados.add(cb.equal(root.get("usuario").get("id"), usuarioActual.getId()));

			if (termino != null) {
				Predicate enTitulo = cb.like(cb.lower(root.get("titulo")), termino);
				Predicate enDescripcion = cb.like(
						cb.lower(cb.coalesce(root.get("descripcion"), "")),
						termino
				);
				predicados.add(cb.or(enTitulo, enDescripcion));
			}
			if (estado != null) {
				predicados.add(cb.equal(root.get("estado"), estado));
			}
			if (prioridad != null) {
				predicados.add(cb.equal(root.get("prioridad"), prioridad));
			}
			if (categoriaId != null) {
				predicados.add(cb.equal(root.get("categoriaId"), categoriaId));
			}
			if (desde != null) {
				predicados.add(cb.greaterThanOrEqualTo(root.get("fechaLimite"), desde));
			}
			if (hasta != null) {
				predicados.add(cb.lessThanOrEqualTo(root.get("fechaLimite"), hasta));
			}
			return cb.and(predicados.toArray(new Predicate[0]));
		};

		Instant ahora = Instant.now(reloj);
		Sort orden = Sort.by(
				Sort.Order.asc("fechaLimite").nullsLast(),
				Sort.Order.desc("fechaCreacion")
		);
		return tareaRepository.findAll(especificacion, orden)
				.stream()
				.map(tarea -> tareaMapper.aRespuesta(tarea, ahora))
				.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public TareaResponse obtenerTarea(UUID id, UsuarioAutenticado usuarioActual) {
		Tarea tarea = cargarTareaDelUsuario(id, usuarioActual.getId());
		return tareaMapper.aRespuesta(tarea, Instant.now(reloj));
	}

	@Override
	@Transactional
	public TareaResponse crearTarea(CrearTareaRequest solicitud, UsuarioAutenticado usuarioActual) {
		Instant ahora = Instant.now(reloj);
		validarFechaLimiteNoPasada(solicitud.fechaLimite(), ahora);
		validarCategoriaDelUsuario(solicitud.categoriaId(), usuarioActual.getId());

		Usuario usuario = usuarioRepository.findById(usuarioActual.getId())
				.orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));

		EstadoTarea estadoInicial = solicitud.estado() != null ? solicitud.estado() : EstadoTarea.PENDIENTE;

		Tarea tarea = new Tarea();
		tarea.setUsuario(usuario);
		tarea.setTitulo(solicitud.titulo().trim());
		tarea.setDescripcion(normalizarOpcional(solicitud.descripcion()));
		tarea.setPrioridad(solicitud.prioridad());
		tarea.setFechaLimite(solicitud.fechaLimite());
		tarea.setEventoId(solicitud.eventoId());
		tarea.setCategoriaId(solicitud.categoriaId());
		aplicarEstadoYProgreso(tarea, estadoInicial, solicitud.porcentajeProgreso(), ahora, true);

		return tareaMapper.aRespuesta(tareaRepository.save(tarea), ahora);
	}

	@Override
	@Transactional
	public TareaResponse actualizarTarea(
			UUID id,
			ActualizarTareaRequest solicitud,
			UsuarioAutenticado usuarioActual
	) {
		Tarea tarea = cargarTareaDelUsuario(id, usuarioActual.getId());
		Instant ahora = Instant.now(reloj);

		if (tarea.getFechaLimite() != null && tarea.getFechaLimite().isBefore(ahora)) {
			throw new ReglaNegocioException(
					"Esta tarea tiene una fecha límite pasada y es de solo consulta; no se puede editar."
			);
		}
		validarFechaLimiteNoPasada(solicitud.fechaLimite(), ahora);
		validarCategoriaDelUsuario(solicitud.categoriaId(), usuarioActual.getId());

		tarea.setTitulo(solicitud.titulo().trim());
		tarea.setDescripcion(normalizarOpcional(solicitud.descripcion()));
		tarea.setPrioridad(solicitud.prioridad());
		tarea.setFechaLimite(solicitud.fechaLimite());
		tarea.setEventoId(solicitud.eventoId());
		tarea.setCategoriaId(solicitud.categoriaId());
		aplicarEstadoYProgreso(tarea, solicitud.estado(), solicitud.porcentajeProgreso(), ahora, false);

		return tareaMapper.aRespuesta(tareaRepository.save(tarea), ahora);
	}

	@Override
	@Transactional
	public TareaResponse cambiarEstado(
			UUID id,
			CambiarEstadoTareaRequest solicitud,
			UsuarioAutenticado usuarioActual
	) {
		Tarea tarea = cargarTareaDelUsuario(id, usuarioActual.getId());
		Instant ahora = Instant.now(reloj);

		aplicarEstadoYProgreso(tarea, solicitud.estado(), solicitud.porcentajeProgreso(), ahora, false);

		return tareaMapper.aRespuesta(tareaRepository.save(tarea), ahora);
	}

	@Override
	@Transactional
	public void eliminarTarea(UUID id, UsuarioAutenticado usuarioActual) {
		Tarea tarea = cargarTareaDelUsuario(id, usuarioActual.getId());
		tareaRepository.delete(tarea);
	}

	private Tarea cargarTareaDelUsuario(UUID id, UUID usuarioId) {
		return tareaRepository.findByIdAndUsuarioId(id, usuarioId)
				.orElseThrow(() -> new RecursoNoEncontradoException("Tarea no encontrada."));
	}

	private void validarFechaLimiteNoPasada(Instant fechaLimite, Instant ahora) {
		if (fechaLimite != null && fechaLimite.isBefore(ahora)) {
			throw new ReglaNegocioException("La fecha límite no puede ser anterior a la fecha y hora actual.");
		}
	}

	private void aplicarEstadoYProgreso(
			Tarea tarea,
			EstadoTarea estado,
			Integer progresoSolicitado,
			Instant ahora,
			boolean esCreacion
	) {
		tarea.setEstado(estado);
		if (estado == EstadoTarea.COMPLETADA) {
			tarea.setPorcentajeProgreso(100);
			if (tarea.getFechaCompletada() == null) {
				tarea.setFechaCompletada(ahora);
			}
			return;
		}

		tarea.setFechaCompletada(null);
		if (estado == EstadoTarea.PENDIENTE && (esCreacion || progresoSolicitado == null)) {
			tarea.setPorcentajeProgreso(0);
			return;
		}

		if (progresoSolicitado != null) {
			tarea.setPorcentajeProgreso(progresoSolicitado);
		}
	}

	private String normalizarOpcional(String valor) {
		if (valor == null || valor.isBlank()) {
			return null;
		}
		return valor.trim();
	}

	private void validarCategoriaDelUsuario(UUID categoriaId, UUID usuarioId) {
		if (categoriaId != null && categoriaRepository.findByIdAndUsuarioId(categoriaId, usuarioId).isEmpty()) {
			throw new RecursoNoEncontradoException("La categoría seleccionada no existe o no pertenece a tu cuenta.");
		}
	}
}
