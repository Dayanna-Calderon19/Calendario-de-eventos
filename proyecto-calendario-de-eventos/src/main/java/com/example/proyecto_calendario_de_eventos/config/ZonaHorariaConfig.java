package com.example.proyecto_calendario_de_eventos.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneOffset;
import java.util.TimeZone;

@Configuration
public class ZonaHorariaConfig {

	@PostConstruct
	public void configurarZonaHorariaUtc() {
		TimeZone.setDefault(TimeZone.getTimeZone(ZoneOffset.UTC));
	}

	@Bean
	public Clock relojSistemaUtc() {
		return Clock.systemUTC();
	}
}
