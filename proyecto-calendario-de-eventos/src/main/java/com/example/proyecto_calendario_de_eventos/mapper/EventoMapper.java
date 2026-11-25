package com.example.proyecto_calendario_de_eventos.mapper;

import com.example.proyecto_calendario_de_eventos.dto.response.EventoResponse;
import com.example.proyecto_calendario_de_eventos.entity.Evento;
import org.springframework.stereotype.Component;

@Component
public class EventoMapper {

	public EventoResponse aRespuesta(Evento evento) {
		return new EventoResponse(
				evento.getId(),
				evento.getTitulo(),
				evento.getDescripcion(),
				evento.getTipo(),
				evento.getFechaInicio(),
				evento.getFechaFin(),
				evento.isDiaCompleto(),
				evento.getZonaHoraria(),
				evento.getUbicacion(),
				evento.getColor(),
				evento.getCategoriaId(),
				evento.getFechaCreacion(),
				evento.getFechaActualizacion()
		);
	}
}
