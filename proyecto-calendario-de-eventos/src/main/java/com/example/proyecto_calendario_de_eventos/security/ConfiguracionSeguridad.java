package com.example.proyecto_calendario_de_eventos.security;

import com.example.proyecto_calendario_de_eventos.config.PropiedadesAplicacion;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class ConfiguracionSeguridad {

	private final PropiedadesAplicacion propiedades;
	private final FiltroAutenticacionJwt filtroAutenticacionJwt;
	private final PuntoEntradaAutenticacionJwt puntoEntradaAutenticacionJwt;

	public ConfiguracionSeguridad(
			PropiedadesAplicacion propiedades,
			FiltroAutenticacionJwt filtroAutenticacionJwt,
			PuntoEntradaAutenticacionJwt puntoEntradaAutenticacionJwt
	) {
		this.propiedades = propiedades;
		this.filtroAutenticacionJwt = filtroAutenticacionJwt;
		this.puntoEntradaAutenticacionJwt = puntoEntradaAutenticacionJwt;
	}

	@Bean
	public SecurityFilterChain cadenaFiltrosSeguridad(HttpSecurity http) throws Exception {
		return http
				.cors(cors -> cors.configurationSource(origenConfiguracionCors()))
				.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(manejo -> manejo.authenticationEntryPoint(puntoEntradaAutenticacionJwt))
				.authorizeHttpRequests(autorizacion -> autorizacion
						.requestMatchers(
								"/api/auth/**",
								"/v3/api-docs/**",
								"/swagger-ui/**",
								"/swagger-ui.html",
								"/actuator/health"
						).permitAll()
						.anyRequest().authenticated()
				)
				.addFilterBefore(filtroAutenticacionJwt, UsernamePasswordAuthenticationFilter.class)
				.build();
	}

	@Bean
	public AuthenticationManager administradorAutenticacion(AuthenticationConfiguration configuracion) throws Exception {
		return configuracion.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder codificadorContrasena() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public CorsConfigurationSource origenConfiguracionCors() {
		CorsConfiguration configuracion = new CorsConfiguration();
		configuracion.setAllowedOrigins(propiedades.getCors().getOrigenesPermitidos());
		configuracion.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuracion.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
		configuracion.setAllowCredentials(true);
		configuracion.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
		fuente.registerCorsConfiguration("/**", configuracion);
		return fuente;
	}
}
