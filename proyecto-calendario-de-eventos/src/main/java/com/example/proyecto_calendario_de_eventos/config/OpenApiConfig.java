package com.example.proyecto_calendario_de_eventos.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	private static final String ESQUEMA_SEGURIDAD = "BearerAuth";

	@Bean
	public OpenAPI documentacionOpenApi() {
		return new OpenAPI()
				.info(new Info()
						.title("API de Gestión de Calendario")
						.description("API REST para la gestión personal de calendario, eventos, tareas, recordatorios y notificaciones.")
						.version("1.0.0"))
				.addSecurityItem(new SecurityRequirement().addList(ESQUEMA_SEGURIDAD))
				.components(new Components()
						.addSecuritySchemes(ESQUEMA_SEGURIDAD, new SecurityScheme()
								.name(ESQUEMA_SEGURIDAD)
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")));
	}
}
