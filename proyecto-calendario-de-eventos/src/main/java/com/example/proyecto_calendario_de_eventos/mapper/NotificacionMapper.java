package com.example.proyecto_calendario_de_eventos.mapper;

import com.example.proyecto_calendario_de_eventos.dto.response.NotificacionResponse;
import com.example.proyecto_calendario_de_eventos.entity.Notificacion;
import org.springframework.stereotype.Component;

@Component
public class NotificacionMapper {

	public NotificacionResponse aRespuesta(Notificacion notificacion) {
		return new NotificacionResponse(
				notificacion.getId(),
				notificacion.getRecordatorioId(),
				notificacion.getTitulo(),
				notificacion.getMensaje(),
				notificacion.isLeida(),
				notificacion.getFechaLectura(),
				notificacion.getFechaCreacion()
		);
	}
}
