package com.example.proyecto_calendario_de_eventos.mapper;

import com.example.proyecto_calendario_de_eventos.dto.response.CategoriaResponse;
import com.example.proyecto_calendario_de_eventos.entity.Categoria;
import org.springframework.stereotype.Component;

@Component
public class CategoriaMapper {

	public CategoriaResponse aRespuesta(Categoria categoria) {
		return new CategoriaResponse(
				categoria.getId(),
				categoria.getNombre(),
				categoria.getColor()
		);
	}
}
