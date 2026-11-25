package com.example.proyecto_calendario_de_eventos.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class ManejadorGlobalExcepciones {

	@ExceptionHandler(RecursoNoEncontradoException.class)
	public ResponseEntity<ErrorApiResponse> manejarRecursoNoEncontrado(
			RecursoNoEncontradoException excepcion,
			HttpServletRequest solicitud
	) {
		return construirRespuesta(HttpStatus.NOT_FOUND, excepcion.getMessage(), solicitud.getRequestURI(), Map.of());
	}

	@ExceptionHandler(ConflictoRecursoException.class)
	public ResponseEntity<ErrorApiResponse> manejarConflicto(
			ConflictoRecursoException excepcion,
			HttpServletRequest solicitud
	) {
		return construirRespuesta(HttpStatus.CONFLICT, excepcion.getMessage(), solicitud.getRequestURI(), Map.of());
	}

	@ExceptionHandler(ReglaNegocioException.class)
	public ResponseEntity<ErrorApiResponse> manejarReglaNegocio(
			ReglaNegocioException excepcion,
			HttpServletRequest solicitud
	) {
		return construirRespuesta(HttpStatus.BAD_REQUEST, excepcion.getMessage(), solicitud.getRequestURI(), Map.of());
	}

	@ExceptionHandler(CredencialesInvalidasException.class)
	public ResponseEntity<ErrorApiResponse> manejarCredencialesInvalidas(
			CredencialesInvalidasException excepcion,
			HttpServletRequest solicitud
	) {
		return construirRespuesta(HttpStatus.UNAUTHORIZED, excepcion.getMessage(), solicitud.getRequestURI(), Map.of());
	}

	@ExceptionHandler(DemasiadosIntentosException.class)
	public ResponseEntity<ErrorApiResponse> manejarDemasiadosIntentos(
			DemasiadosIntentosException excepcion,
			HttpServletRequest solicitud
	) {
		return construirRespuesta(HttpStatus.TOO_MANY_REQUESTS, excepcion.getMessage(), solicitud.getRequestURI(), Map.of());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorApiResponse> manejarValidacion(
			MethodArgumentNotValidException excepcion,
			HttpServletRequest solicitud
	) {
		Map<String, String> detalles = new LinkedHashMap<>();
		for (FieldError errorCampo : excepcion.getBindingResult().getFieldErrors()) {
			detalles.putIfAbsent(errorCampo.getField(), errorCampo.getDefaultMessage());
		}
		return construirRespuesta(HttpStatus.BAD_REQUEST, "La solicitud contiene datos inválidos.", solicitud.getRequestURI(), detalles);
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ErrorApiResponse> manejarNoAutenticado(
			AuthenticationException excepcion,
			HttpServletRequest solicitud
	) {
		return construirRespuesta(HttpStatus.UNAUTHORIZED, "Autenticación requerida o inválida.", solicitud.getRequestURI(), Map.of());
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ErrorApiResponse> manejarAccesoDenegado(
			AccessDeniedException excepcion,
			HttpServletRequest solicitud
	) {
		return construirRespuesta(HttpStatus.FORBIDDEN, "No tiene permisos para acceder a este recurso.", solicitud.getRequestURI(), Map.of());
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ErrorApiResponse> manejarRutaNoEncontrada(
			NoResourceFoundException excepcion,
			HttpServletRequest solicitud
	) {
		return construirRespuesta(HttpStatus.NOT_FOUND, "El recurso solicitado no existe.", solicitud.getRequestURI(), Map.of());
	}

	@ExceptionHandler({
			HttpMessageNotReadableException.class,
			MethodArgumentTypeMismatchException.class,
			MissingServletRequestParameterException.class
	})
	public ResponseEntity<ErrorApiResponse> manejarSolicitudMalFormada(
			Exception excepcion,
			HttpServletRequest solicitud
	) {
		return construirRespuesta(HttpStatus.BAD_REQUEST, "El formato de los datos enviados no es válido.", solicitud.getRequestURI(), Map.of());
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorApiResponse> manejarErrorInesperado(
			Exception excepcion,
			HttpServletRequest solicitud
	) {
		log.error("Error interno al procesar la ruta {}", solicitud.getRequestURI(), excepcion);
		return construirRespuesta(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error interno en el servidor.", solicitud.getRequestURI(), Map.of());
	}

	private ResponseEntity<ErrorApiResponse> construirRespuesta(
			HttpStatus estado,
			String mensaje,
			String ruta,
			Map<String, String> detalles
	) {
		ErrorApiResponse cuerpo = new ErrorApiResponse(
				Instant.now(),
				estado.value(),
				estado.getReasonPhrase(),
				mensaje,
				ruta,
				detalles
		);
		return ResponseEntity.status(estado).body(cuerpo);
	}
}
