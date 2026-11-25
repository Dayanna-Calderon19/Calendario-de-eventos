package com.example.proyecto_calendario_de_eventos.service.impl;

import com.example.proyecto_calendario_de_eventos.config.PropiedadesAplicacion;
import com.example.proyecto_calendario_de_eventos.entity.Evento;
import com.example.proyecto_calendario_de_eventos.entity.Notificacion;
import com.example.proyecto_calendario_de_eventos.entity.Recordatorio;
import com.example.proyecto_calendario_de_eventos.entity.Tarea;
import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.repository.EventoRepository;
import com.example.proyecto_calendario_de_eventos.repository.NotificacionRepository;
import com.example.proyecto_calendario_de_eventos.repository.RecordatorioRepository;
import com.example.proyecto_calendario_de_eventos.repository.TareaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProcesadorRecordatoriosJob {

	private static final DateTimeFormatter FORMATO_FECHA =
			DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

	private final RecordatorioRepository recordatorioRepository;
	private final NotificacionRepository notificacionRepository;
	private final EventoRepository eventoRepository;
	private final TareaRepository tareaRepository;
	private final PropiedadesAplicacion propiedades;
	private final Clock reloj;

	@Scheduled(fixedDelay = 30000)
	@Transactional
	public void procesarRecordatoriosPendientes() {
		Instant ahora = Instant.now(reloj);
		List<Recordatorio> pendientes = recordatorioRepository
				.findByProcesadoFalseAndFechaActivacionLessThanEqual(ahora);

		for (Recordatorio recordatorio : pendientes) {
			try {
				procesarIndividual(recordatorio, ahora);
			} catch (Exception ex) {
				log.error("Error procesando recordatorio {}: {}", recordatorio.getId(), ex.getMessage());
			}
		}
	}

	private void procesarIndividual(Recordatorio recordatorio, Instant ahora) {
		if (recordatorio.getEventoId() != null) {
			Evento evento = eventoRepository
					.findByIdAndUsuarioIdAndEliminadoFalse(
							recordatorio.getEventoId(), recordatorio.getUsuario().getId())
					.orElse(null);

			if (evento != null) {
				ZoneId zona = ZoneId.of(evento.getZonaHoraria() != null
						? evento.getZonaHoraria()
						: propiedades.getZonaHoraria());
				String fechaLocal = FORMATO_FECHA.format(evento.getFechaInicio().atZone(zona));
				crearNotificacion(
						recordatorio,
						"Recordatorio de evento: " + evento.getTitulo(),
						"Tu evento \"" + evento.getTitulo() + "\" comienza el " + fechaLocal + "."
				);
			}
		} else if (recordatorio.getTareaId() != null) {
			Tarea tarea = tareaRepository
					.findByIdAndUsuarioId(recordatorio.getTareaId(), recordatorio.getUsuario().getId())
					.orElse(null);

			if (tarea != null && tarea.getEstado() != EstadoTarea.COMPLETADA && tarea.getFechaLimite() != null) {
				ZoneId zona = ZoneId.of(propiedades.getZonaHoraria());
				String fechaLocal = FORMATO_FECHA.format(tarea.getFechaLimite().atZone(zona));
				crearNotificacion(
						recordatorio,
						"Recordatorio de tarea: " + tarea.getTitulo(),
						"La tarea \"" + tarea.getTitulo() + "\" vence el " + fechaLocal + "."
				);
			}
		}

		recordatorio.setProcesado(true);
		recordatorio.setFechaProcesamiento(ahora);
		recordatorioRepository.save(recordatorio);
	}

	private void crearNotificacion(Recordatorio recordatorio, String titulo, String mensaje) {
		Notificacion notificacion = new Notificacion();
		notificacion.setUsuario(recordatorio.getUsuario());
		notificacion.setRecordatorioId(recordatorio.getId());
		notificacion.setTitulo(titulo.length() > 150 ? titulo.substring(0, 150) : titulo);
		notificacion.setMensaje(mensaje.length() > 500 ? mensaje.substring(0, 500) : mensaje);
		notificacion.setLeida(false);
		notificacionRepository.save(notificacion);
	}
}
