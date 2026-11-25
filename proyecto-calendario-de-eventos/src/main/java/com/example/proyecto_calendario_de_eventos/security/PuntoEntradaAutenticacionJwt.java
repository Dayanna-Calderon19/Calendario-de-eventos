package com.example.proyecto_calendario_de_eventos.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Component
public class PuntoEntradaAutenticacionJwt implements AuthenticationEntryPoint {

	private final HandlerExceptionResolver resolvedorExcepciones;

	public PuntoEntradaAutenticacionJwt(
			@Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolvedorExcepciones
	) {
		this.resolvedorExcepciones = resolvedorExcepciones;
	}

	@Override
	public void commence(
			HttpServletRequest solicitud,
			HttpServletResponse respuesta,
			AuthenticationException excepcionAutenticacion
	) {
		resolvedorExcepciones.resolveException(solicitud, respuesta, null, excepcionAutenticacion);
	}
}
