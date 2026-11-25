package com.example.proyecto_calendario_de_eventos.service.impl;

import com.example.proyecto_calendario_de_eventos.dto.request.CrearRecordatorioRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.RecordatorioResponse;
import com.example.proyecto_calendario_de_eventos.entity.Evento;
import com.example.proyecto_calendario_de_eventos.entity.Recordatorio;
import com.example.proyecto_calendario_de_eventos.entity.Tarea;
import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.exception.RecursoNoEncontradoException;
import com.example.proyecto_calendario_de_eventos.exception.ReglaNegocioException;
import com.example.proyecto_calendario_de_eventos.mapper.RecordatorioMapper;
import com.example.proyecto_calendario_de_eventos.repository.EventoRepository;
import com.example.proyecto_calendario_de_eventos.repository.RecordatorioRepository;
import com.example.proyecto_calendario_de_eventos.repository.TareaRepository;
import com.example.proyecto_calendario_de_eventos.repository.UsuarioRepository;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.RecordatorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecordatorioServiceImpl implements RecordatorioService {

	private static final String CANAL_PREDETERMINADO = "APLICACION";

	private final RecordatorioRepository recordatorioRepository;
	private final EventoRepository eventoRepository;
	private final TareaRepository tareaRepository;
	private final UsuarioRepository usuarioRepository;
	private final RecordatorioMapper recordatorioMapper;
	private final Clock reloj;

	@Override
	@Transactional(readOnly = true)
	public List<RecordatorioResponse> listarRecordatorios(
			UUID eventoId,
			UUID tareaId,
			UsuarioAutenticado usuarioActual
	) {
		return recordatorioRepository.buscarPorUsuario(usuarioActual.getId(), eventoId, tareaId)
				.stream()
				.map(r -> recordatorioMapper.aRespuesta(r, resolverTituloReferencia(r, usuarioActual.getId())))
				.toList();
	}

	@Override
	@Transactional
	public RecordatorioResponse crearRecordatorio(
			CrearRecordatorioRequest solicitud,
			UsuarioAutenticado usuarioActual
	) {
		boolean tieneEvento = solicitud.eventoId() != null;
		boolean tieneTarea = solicitud.tareaId() != null;
		if (tieneEvento == tieneTarea) {
			throw new ReglaNegocioException(
					"Debes asociar el recordatorio exactamente a un evento o a una tarea."
			);
		}

		Usuario usuario = usuarioRepository.findById(usuarioActual.getId())
				.orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));

		String canal = (solicitud.canal() == null || solicitud.canal().isBlank())
				? CANAL_PREDETERMINADO
				: solicitud.canal().trim().toUpperCase();

		Instant ahora = Instant.now(reloj);
		Instant fechaActivacion;
		String tituloReferencia;

		if (tieneEvento) {
			Evento evento = eventoRepository
					.findByIdAndUsuarioIdAndEliminadoFalse(solicitud.eventoId(), usuarioActual.getId())
					.orElseThrow(() -> new RecursoNoEncontradoException(
							"El evento seleccionado no existe o no pertenece a tu cuenta."
					));

			if (recordatorioRepository.existsByUsuarioIdAndEventoIdAndMinutosAnticipacionAndCanal(
					usuarioActual.getId(), evento.getId(), solicitud.minutosAnticipacion(), canal)) {
				throw new ReglaNegocioException(
						"Ya existe un recordatorio configurado con esa misma anticipación para este evento."
				);
			}

			fechaActivacion = evento.getFechaInicio()
					.minus(solicitud.minutosAnticipacion(), ChronoUnit.MINUTES);
			if (fechaActivacion.isBefore(ahora)) {
				throw new ReglaNegocioException(
						"La fecha de activación del recordatorio ya pasó. Elige una anticipación menor o un evento futuro."
				);
			}
			tituloReferencia = evento.getTitulo();
		} else {
			Tarea tarea = tareaRepository
					.findByIdAndUsuarioId(solicitud.tareaId(), usuarioActual.getId())
					.orElseThrow(() -> new RecursoNoEncontradoException(
							"La tarea seleccionada no existe o no pertenece a tu cuenta."
					));

			if (tarea.getEstado() == EstadoTarea.COMPLETADA) {
				throw new ReglaNegocioException(
						"No se pueden configurar recordatorios para una tarea que ya está completada."
				);
			}
			if (tarea.getFechaLimite() == null) {
				throw new ReglaNegocioException(
						"La tarea debe tener una fecha límite asignada para poder configurar un recordatorio."
				);
			}
			if (recordatorioRepository.existsByUsuarioIdAndTareaIdAndMinutosAnticipacionAndCanal(
					usuarioActual.getId(), tarea.getId(), solicitud.minutosAnticipacion(), canal)) {
				throw new ReglaNegocioException(
						"Ya existe un recordatorio configurado con esa misma anticipación para esta tarea."
				);
			}

			fechaActivacion = tarea.getFechaLimite()
					.minus(solicitud.minutosAnticipacion(), ChronoUnit.MINUTES);
			if (fechaActivacion.isBefore(ahora)) {
				throw new ReglaNegocioException(
						"La fecha de activación del recordatorio ya pasó. Elige una anticipación menor o una fecha límite futura."
				);
			}
			tituloReferencia = tarea.getTitulo();
		}

		Recordatorio recordatorio = new Recordatorio();
		recordatorio.setUsuario(usuario);
		recordatorio.setEventoId(solicitud.eventoId());
		recordatorio.setTareaId(solicitud.tareaId());
		recordatorio.setMinutosAnticipacion(solicitud.minutosAnticipacion());
		recordatorio.setFechaActivacion(fechaActivacion);
		recordatorio.setCanal(canal);
		recordatorio.setProcesado(false);

		Recordatorio guardado = recordatorioRepository.save(recordatorio);
		return recordatorioMapper.aRespuesta(guardado, tituloReferencia);
	}

	@Override
	@Transactional
	public void eliminarRecordatorio(UUID id, UsuarioAutenticado usuarioActual) {
		Recordatorio recordatorio = recordatorioRepository.findByIdAndUsuarioId(id, usuarioActual.getId())
				.orElseThrow(() -> new RecursoNoEncontradoException("Recordatorio no encontrado."));
		recordatorioRepository.delete(recordatorio);
	}

	private String resolverTituloReferencia(Recordatorio recordatorio, UUID usuarioId) {
		if (recordatorio.getEventoId() != null) {
			return eventoRepository.findByIdAndUsuarioIdAndEliminadoFalse(recordatorio.getEventoId(), usuarioId)
					.map(Evento::getTitulo)
					.orElse("Evento eliminado");
		}
		if (recordatorio.getTareaId() != null) {
			return tareaRepository.findByIdAndUsuarioId(recordatorio.getTareaId(), usuarioId)
					.map(Tarea::getTitulo)
					.orElse("Tarea eliminada");
		}
		return "";
	}
}
