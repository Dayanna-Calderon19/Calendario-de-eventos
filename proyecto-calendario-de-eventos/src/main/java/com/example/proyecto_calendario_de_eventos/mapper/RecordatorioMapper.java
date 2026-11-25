package com.example.proyecto_calendario_de_eventos.mapper;

import com.example.proyecto_calendario_de_eventos.dto.response.RecordatorioResponse;
import com.example.proyecto_calendario_de_eventos.entity.Recordatorio;
import org.springframework.stereotype.Component;

@Component
public class RecordatorioMapper {

	public RecordatorioResponse aRespuesta(Recordatorio recordatorio, String tituloReferencia) {
		return new RecordatorioResponse(
				recordatorio.getId(),
				recordatorio.getEventoId(),
				recordatorio.getTareaId(),
				recordatorio.getMinutosAnticipacion(),
				recordatorio.getFechaActivacion(),
				recordatorio.getCanal(),
				recordatorio.isProcesado(),
				tituloReferencia
		);
	}
}
