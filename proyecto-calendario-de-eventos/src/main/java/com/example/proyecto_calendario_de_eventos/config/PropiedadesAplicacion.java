package com.example.proyecto_calendario_de_eventos.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class PropiedadesAplicacion {

	private String zonaHoraria = "America/Lima";
	private Jwt jwt = new Jwt();
	private Cors cors = new Cors();
	private Cookie cookie = new Cookie();
	private Recuperacion recuperacion = new Recuperacion();

	@Getter
	@Setter
	public static class Jwt {
		private String secreto;
		private long expiracionAccesoMs = 900000L;
		private long expiracionRefreshMs = 604800000L;
	}

	@Getter
	@Setter
	public static class Cors {
		private List<String> origenesPermitidos = new ArrayList<>(List.of("http://localhost:4200"));
	}

	@Getter
	@Setter
	public static class Cookie {
		private boolean segura = false;
		private String mismoSitio = "Lax";
	}

	@Getter
	@Setter
	public static class Recuperacion {
		private long expiracionMs = 1800000L;
	}
}
