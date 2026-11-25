package com.example.proyecto_calendario_de_eventos.security;

import com.example.proyecto_calendario_de_eventos.exception.DemasiadosIntentosException;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ControladorIntentosAutenticacion {

	private static final int MAXIMO_INTENTOS_LOGIN = 5;
	private static final Duration VENTANA_BLOQUEO_LOGIN = Duration.ofMinutes(15);
	private static final int MAXIMO_SOLICITUDES_RECUPERACION = 5;
	private static final Duration VENTANA_RECUPERACION = Duration.ofMinutes(15);

	private final Clock reloj;
	private final Map<String, RegistroIntentos> registrosLogin = new ConcurrentHashMap<>();
	private final Map<String, RegistroIntentos> registrosRecuperacion = new ConcurrentHashMap<>();

	public ControladorIntentosAutenticacion(Clock reloj) {
		this.reloj = reloj;
	}

	public void verificarPermitidoInicioSesion(String clave) {
		verificarLimite(registrosLogin, clave, MAXIMO_INTENTOS_LOGIN, VENTANA_BLOQUEO_LOGIN,
				"Demasiados intentos fallidos de inicio de sesión. Intenta nuevamente más tarde.");
	}

	public void registrarFalloInicioSesion(String clave) {
		registrarIntento(registrosLogin, clave, VENTANA_BLOQUEO_LOGIN);
	}

	public void limpiarIntentosInicioSesion(String clave) {
		registrosLogin.remove(clave);
	}

	public void verificarYRegistrarRecuperacion(String clave) {
		verificarLimite(registrosRecuperacion, clave, MAXIMO_SOLICITUDES_RECUPERACION, VENTANA_RECUPERACION,
				"Demasiadas solicitudes de recuperación. Intenta nuevamente más tarde.");
		registrarIntento(registrosRecuperacion, clave, VENTANA_RECUPERACION);
	}

	private void verificarLimite(
			Map<String, RegistroIntentos> mapa,
			String clave,
			int maximoIntentos,
			Duration ventana,
			String mensajeError
	) {
		Instant ahora = reloj.instant();
		RegistroIntentos registro = mapa.get(clave);
		if (registro == null) {
			return;
		}
		if (ahora.isAfter(registro.inicioVentana().plus(ventana))) {
			mapa.remove(clave);
			return;
		}
		if (registro.cantidad() >= maximoIntentos) {
			throw new DemasiadosIntentosException(mensajeError);
		}
	}

	private void registrarIntento(Map<String, RegistroIntentos> mapa, String clave, Duration ventana) {
		Instant ahora = reloj.instant();
		mapa.compute(clave, (k, actual) -> {
			if (actual == null || ahora.isAfter(actual.inicioVentana().plus(ventana))) {
				return new RegistroIntentos(1, ahora);
			}
			return new RegistroIntentos(actual.cantidad() + 1, actual.inicioVentana());
		});
	}

	private record RegistroIntentos(int cantidad, Instant inicioVentana) {
	}
}
