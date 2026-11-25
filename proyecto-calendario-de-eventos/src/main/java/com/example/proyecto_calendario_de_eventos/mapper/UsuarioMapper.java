package com.example.proyecto_calendario_de_eventos.mapper;

import com.example.proyecto_calendario_de_eventos.dto.response.UsuarioResponse;
import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

	public UsuarioResponse aRespuesta(Usuario usuario) {
		return new UsuarioResponse(
				usuario.getId(),
				usuario.getNombres(),
				usuario.getApellidos(),
				usuario.getCorreo(),
				usuario.isActivo(),
				usuario.getFechaCreacion()
		);
	}
}
