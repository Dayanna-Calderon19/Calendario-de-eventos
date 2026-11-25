package com.example.proyecto_calendario_de_eventos.service.impl;

import com.example.proyecto_calendario_de_eventos.config.PropiedadesAplicacion;
import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.ReprogramarEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.EventoResponse;
import com.example.proyecto_calendario_de_eventos.entity.Evento;
import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import com.example.proyecto_calendario_de_eventos.enums.TipoEvento;
import com.example.proyecto_calendario_de_eventos.exception.RecursoNoEncontradoException;
import com.example.proyecto_calendario_de_eventos.exception.ReglaNegocioException;
import com.example.proyecto_calendario_de_eventos.mapper.EventoMapper;
import com.example.proyecto_calendario_de_eventos.repository.CategoriaRepository;
import com.example.proyecto_calendario_de_eventos.repository.EventoRepository;
import com.example.proyecto_calendario_de_eventos.repository.UsuarioRepository;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.EventoService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventoServiceImpl implements EventoService {

	private static final long MAXIMO_DIAS_RANGO_CALENDARIO = 366L;

	private final EventoRepository eventoRepository;
	private final CategoriaRepository categoriaRepository;
	private final UsuarioRepository usuarioRepository;
	private final EventoMapper eventoMapper;
	private final PropiedadesAplicacion propiedades;
	private final Clock reloj;

	@Override
	@Transactional(readOnly = true)
	public List<EventoResponse> obtenerEventosCalendario(
			Instant inicio,
			Instant fin,
			UsuarioAutenticado usuarioActual
	) {
		if (!fin.isAfter(inicio)) {
			throw new ReglaNegocioException("La fecha de fin del rango debe ser posterior a la fecha de inicio.");
		}
		if (Duration.between(inicio, fin).toDays() > MAXIMO_DIAS_RANGO_CALENDARIO) {
			throw new ReglaNegocioException("El rango consultado no debe superar un año.");
		}
		return eventoRepository.buscarPorUsuarioYRango(usuarioActual.getId(), inicio, fin)
				.stream()
				.map(eventoMapper::aRespuesta)
				.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<EventoResponse> listarEventos(
			String busqueda,
			TipoEvento tipo,
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

		Specification<Evento> especificacion = (root, query, cb) -> {
			List<Predicate> predicados = new ArrayList<>();
			predicados.add(cb.equal(root.get("usuario").get("id"), usuarioActual.getId()));
			predicados.add(cb.isFalse(root.get("eliminado")));

			if (termino != null) {
				Predicate enTitulo = cb.like(cb.lower(root.get("titulo")), termino);
				Predicate enDescripcion = cb.like(
						cb.lower(cb.coalesce(root.get("descripcion"), "")),
						termino
				);
				predicados.add(cb.or(enTitulo, enDescripcion));
			}
			if (tipo != null) {
				predicados.add(cb.equal(root.get("tipo"), tipo));
			}
			if (categoriaId != null) {
				predicados.add(cb.equal(root.get("categoriaId"), categoriaId));
			}
			if (desde != null) {
				predicados.add(cb.greaterThanOrEqualTo(root.get("fechaFin"), desde));
			}
			if (hasta != null) {
				predicados.add(cb.lessThanOrEqualTo(root.get("fechaInicio"), hasta));
			}
			return cb.and(predicados.toArray(new Predicate[0]));
		};

		return eventoRepository.findAll(especificacion, Sort.by(Sort.Direction.ASC, "fechaInicio"))
				.stream()
				.map(eventoMapper::aRespuesta)
				.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public EventoResponse obtenerEvento(UUID id, UsuarioAutenticado usuarioActual) {
		return eventoMapper.aRespuesta(cargarEventoDelUsuario(id, usuarioActual.getId()));
	}

	@Override
	@Transactional
	public EventoResponse crearEvento(CrearEventoRequest solicitud, UsuarioAutenticado usuarioActual) {
		validarRangoFechas(solicitud.fechaInicio(), solicitud.fechaFin());
		String zonaHoraria = resolverZonaHoraria(solicitud.zonaHoraria());
		validarFechaNoPasada(solicitud.fechaInicio(), solicitud.diaCompleto(), zonaHoraria);
		validarCategoriaDelUsuario(solicitud.categoriaId(), usuarioActual.getId());

		Usuario usuario = usuarioRepository.findById(usuarioActual.getId())
				.orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));

		Evento evento = new Evento();
		evento.setUsuario(usuario);
		evento.setTitulo(solicitud.titulo().trim());
		evento.setDescripcion(normalizarOpcional(solicitud.descripcion()));
		evento.setTipo(solicitud.tipo());
		evento.setFechaInicio(solicitud.fechaInicio());
		evento.setFechaFin(solicitud.fechaFin());
		evento.setDiaCompleto(solicitud.diaCompleto());
		evento.setZonaHoraria(zonaHoraria);
		evento.setUbicacion(normalizarOpcional(solicitud.ubicacion()));
		evento.setColor(normalizarOpcional(solicitud.color()));
		evento.setCategoriaId(solicitud.categoriaId());

		return eventoMapper.aRespuesta(eventoRepository.save(evento));
	}

	@Override
	@Transactional
	public EventoResponse actualizarEvento(
			UUID id,
			ActualizarEventoRequest solicitud,
			UsuarioAutenticado usuarioActual
	) {
		Evento evento = cargarEventoDelUsuario(id, usuarioActual.getId());
		validarEventoEditable(evento);
		validarRangoFechas(solicitud.fechaInicio(), solicitud.fechaFin());
		String zonaHoraria = resolverZonaHoraria(solicitud.zonaHoraria());
		validarFechaNoPasada(solicitud.fechaInicio(), solicitud.diaCompleto(), zonaHoraria);
		validarCategoriaDelUsuario(solicitud.categoriaId(), usuarioActual.getId());

		evento.setTitulo(solicitud.titulo().trim());
		evento.setDescripcion(normalizarOpcional(solicitud.descripcion()));
		evento.setTipo(solicitud.tipo());
		evento.setFechaInicio(solicitud.fechaInicio());
		evento.setFechaFin(solicitud.fechaFin());
		evento.setDiaCompleto(solicitud.diaCompleto());
		evento.setZonaHoraria(zonaHoraria);
		evento.setUbicacion(normalizarOpcional(solicitud.ubicacion()));
		evento.setColor(normalizarOpcional(solicitud.color()));
		evento.setCategoriaId(solicitud.categoriaId());

		return eventoMapper.aRespuesta(eventoRepository.save(evento));
	}

	@Override
	@Transactional
	public EventoResponse reprogramarEvento(
			UUID id,
			ReprogramarEventoRequest solicitud,
			UsuarioAutenticado usuarioActual
	) {
		Evento evento = cargarEventoDelUsuario(id, usuarioActual.getId());
		validarEventoEditable(evento);
		validarRangoFechas(solicitud.fechaInicio(), solicitud.fechaFin());
		boolean diaCompleto = solicitud.diaCompleto() != null ? solicitud.diaCompleto() : evento.isDiaCompleto();
		validarFechaNoPasada(solicitud.fechaInicio(), diaCompleto, evento.getZonaHoraria());

		evento.setFechaInicio(solicitud.fechaInicio());
		evento.setFechaFin(solicitud.fechaFin());
		if (solicitud.diaCompleto() != null) {
			evento.setDiaCompleto(solicitud.diaCompleto());
		}

		return eventoMapper.aRespuesta(eventoRepository.save(evento));
	}

	@Override
	@Transactional
	public void eliminarEvento(UUID id, UsuarioAutenticado usuarioActual) {
		Evento evento = cargarEventoDelUsuario(id, usuarioActual.getId());
		evento.setEliminado(true);
		evento.setFechaEliminacion(Instant.now(reloj));
		eventoRepository.save(evento);
	}

	private Evento cargarEventoDelUsuario(UUID eventoId, UUID usuarioId) {
		return eventoRepository.findByIdAndUsuarioIdAndEliminadoFalse(eventoId, usuarioId)
				.orElseThrow(() -> new RecursoNoEncontradoException("Evento no encontrado."));
	}

	private void validarRangoFechas(Instant inicio, Instant fin) {
		if (!fin.isAfter(inicio)) {
			throw new ReglaNegocioException("La fecha y hora de finalización deben ser posteriores al inicio.");
		}
	}

	private void validarEventoEditable(Evento evento) {
		Instant ahora = Instant.now(reloj);
		if (evento.getFechaFin().isBefore(ahora)) {
			throw new ReglaNegocioException(
					"Este evento pertenece a una fecha pasada y es de solo consulta; no se puede editar ni reprogramar."
			);
		}
	}

	private void validarFechaNoPasada(Instant fechaInicio, boolean diaCompleto, String zonaHoraria) {
		Instant ahora = Instant.now(reloj);
		if (diaCompleto) {
			ZoneId zona = ZoneId.of(zonaHoraria);
			LocalDate fechaEvento = fechaInicio.atZone(zona).toLocalDate();
			LocalDate hoy = ahora.atZone(zona).toLocalDate();
			if (fechaEvento.isBefore(hoy)) {
				throw new ReglaNegocioException("No puedes programar un evento en una fecha anterior al día actual.");
			}
			return;
		}
		if (fechaInicio.isBefore(ahora)) {
			throw new ReglaNegocioException("No puedes programar un evento en una fecha u hora anterior a la actual.");
		}
	}

	private String resolverZonaHoraria(String zonaHoraria) {
		if (zonaHoraria == null || zonaHoraria.isBlank()) {
			return propiedades.getZonaHoraria();
		}
		return zonaHoraria.trim();
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
