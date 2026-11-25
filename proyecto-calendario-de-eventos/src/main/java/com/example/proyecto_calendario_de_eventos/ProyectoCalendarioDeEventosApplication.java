package com.example.proyecto_calendario_de_eventos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
public class ProyectoCalendarioDeEventosApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProyectoCalendarioDeEventosApplication.class, args);
	}
}
