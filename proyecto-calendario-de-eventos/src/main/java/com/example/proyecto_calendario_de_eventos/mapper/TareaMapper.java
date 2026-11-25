package com.example.proyecto_calendario_de_eventos.mapper;

import com.example.proyecto_calendario_de_eventos.dto.response.TareaResponse;
import com.example.proyecto_calendario_de_eventos.entity.Tarea;
import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class TareaMapper {

	public TareaResponse aRespuesta(Tarea tarea, Instant ahora) {
		boolean vencida = tarea.getFechaLimite() != null
				&& tarea.getEstado() != EstadoTarea.COMPLETADA
				&& tarea.getFechaLimite().isBefore(ahora);

		return new TareaResponse(
				tarea.getId(),
				tarea.getTitulo(),
				tarea.getDescripcion(),
				tarea.getPrioridad(),
				tarea.getEstado(),
				tarea.getPorcentajeProgreso(),
				tarea.getFechaLimite(),
				tarea.getFechaCompletada(),
				tarea.getEventoId(),
				tarea.getCategoriaId(),
				vencida,
				tarea.getFechaCreacion(),
				tarea.getFechaActualizacion()
		);
	}
}
