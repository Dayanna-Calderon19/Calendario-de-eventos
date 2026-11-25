package com.example.proyecto_calendario_de_eventos.service.impl;

import com.example.proyecto_calendario_de_eventos.dto.response.NotificacionResponse;
import com.example.proyecto_calendario_de_eventos.entity.Notificacion;
import com.example.proyecto_calendario_de_eventos.exception.RecursoNoEncontradoException;
import com.example.proyecto_calendario_de_eventos.mapper.NotificacionMapper;
import com.example.proyecto_calendario_de_eventos.repository.NotificacionRepository;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

	private final NotificacionRepository notificacionRepository;
	private final NotificacionMapper notificacionMapper;
	private final Clock reloj;

	@Override
	@Transactional(readOnly = true)
	public List<NotificacionResponse> listarNotificaciones(UsuarioAutenticado usuarioActual) {
		return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioActual.getId())
				.stream()
				.map(notificacionMapper::aRespuesta)
				.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public long contarNoLeidas(UsuarioAutenticado usuarioActual) {
		return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioActual.getId());
	}

	@Override
	@Transactional
	public NotificacionResponse marcarComoLeida(UUID id, UsuarioAutenticado usuarioActual) {
		Notificacion notificacion = notificacionRepository.findByIdAndUsuarioId(id, usuarioActual.getId())
				.orElseThrow(() -> new RecursoNoEncontradoException("Notificación no encontrada."));

		if (!notificacion.isLeida()) {
			notificacion.setLeida(true);
			notificacion.setFechaLectura(Instant.now(reloj));
			notificacion = notificacionRepository.save(notificacion);
		}
		return notificacionMapper.aRespuesta(notificacion);
	}

	@Override
	@Transactional
	public void marcarTodasComoLeidas(UsuarioAutenticado usuarioActual) {
		Instant ahora = Instant.now(reloj);
		List<Notificacion> pendientes = notificacionRepository
				.findByUsuarioIdOrderByFechaCreacionDesc(usuarioActual.getId())
				.stream()
				.filter(n -> !n.isLeida())
				.toList();

		for (Notificacion n : pendientes) {
			n.setLeida(true);
			n.setFechaLectura(ahora);
		}
		if (!pendientes.isEmpty()) {
			notificacionRepository.saveAll(pendientes);
		}
	}

	@Override
	@Transactional
	public void eliminarNotificacion(UUID id, UsuarioAutenticado usuarioActual) {
		Notificacion notificacion = notificacionRepository.findByIdAndUsuarioId(id, usuarioActual.getId())
				.orElseThrow(() -> new RecursoNoEncontradoException("Notificación no encontrada."));
		notificacionRepository.delete(notificacion);
	}
}
