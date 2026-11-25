package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.CrearEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RegistroUsuarioRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.ReprogramarEventoRequest;
import com.example.proyecto_calendario_de_eventos.enums.TipoEvento;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.Instant;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarEventoRequest;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
class EventoControllerIntegrationTest {

	@Autowired
	private WebApplicationContext contextoWeb;

	private MockMvc mockMvc;
	private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

	@BeforeEach
	void configurar() {
		mockMvc = MockMvcBuilders
				.webAppContextSetup(contextoWeb)
				.apply(springSecurity())
				.build();
	}

	private String registrarYObtenerToken(String correo) throws Exception {
		RegistroUsuarioRequest solicitud = new RegistroUsuarioRequest(
				"Usuario", "Prueba", correo, "Test1234!", "Test1234!");
		MvcResult resultado = mockMvc.perform(post("/api/auth/registro")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andReturn();
		return objectMapper.readTree(resultado.getResponse().getContentAsString())
				.get("tokenAcceso").asText();
	}

	private String crearEventoPrueba(String token, String titulo) throws Exception {
		Instant inicio = Instant.now().plusSeconds(86400).truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
		Instant fin = inicio.plusSeconds(5400);
		CrearEventoRequest solicitud = new CrearEventoRequest(
				titulo,
				"Descripción de prueba",
				TipoEvento.EVENTO,
				inicio,
				fin,
				false,
				"America/Lima",
				"Oficina",
				"#4F46E5",
				null
		);
		MvcResult resultado = mockMvc.perform(post("/api/eventos")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andExpect(status().isCreated())
				.andReturn();
		JsonNode nodo = objectMapper.readTree(resultado.getResponse().getContentAsString());
		return nodo.get("id").asText();
	}

	@Test
	void consultar_calendario_sin_token_devuelve_401() throws Exception {
		mockMvc.perform(get("/api/eventos/calendario")
						.param("inicio", "2026-11-01T00:00:00Z")
						.param("fin", "2026-12-01T00:00:00Z"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void crear_y_consultar_eventos_en_calendario() throws Exception {
		String token = registrarYObtenerToken("cal1@ejemplo.com");
		crearEventoPrueba(token, "Reunión semanal");

		Instant inicioRango = Instant.now().minusSeconds(3600).truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
		Instant finRango = Instant.now().plusSeconds(172800).truncatedTo(java.time.temporal.ChronoUnit.SECONDS);

		mockMvc.perform(get("/api/eventos/calendario")
						.header("Authorization", "Bearer " + token)
						.param("inicio", inicioRango.toString())
						.param("fin", finRango.toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].titulo").value("Reunión semanal"));
	}

	@Test
	void reprogramar_evento_actualiza_fechas() throws Exception {
		String token = registrarYObtenerToken("cal2@ejemplo.com");
		String eventoId = crearEventoPrueba(token, "Cita médica");

		Instant nuevoInicio = Instant.now().plusSeconds(172800).truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
		Instant nuevoFin = nuevoInicio.plusSeconds(3600);
		ReprogramarEventoRequest solicitud = new ReprogramarEventoRequest(
				nuevoInicio,
				nuevoFin,
				false
		);

		mockMvc.perform(patch("/api/eventos/{id}/reprogramar", eventoId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.fechaInicio").value(nuevoInicio.toString()));
	}

	@Test
	void usuario_no_puede_ver_ni_eliminar_evento_de_otro_usuario() throws Exception {
		String tokenDueno = registrarYObtenerToken("dueno@ejemplo.com");
		String tokenOtro = registrarYObtenerToken("otro@ejemplo.com");
		String eventoId = crearEventoPrueba(tokenDueno, "Evento privado");

		mockMvc.perform(get("/api/eventos/{id}", eventoId)
						.header("Authorization", "Bearer " + tokenOtro))
				.andExpect(status().isNotFound());

		mockMvc.perform(delete("/api/eventos/{id}", eventoId)
						.header("Authorization", "Bearer " + tokenOtro))
				.andExpect(status().isNotFound());
	}

	@Test
	void crear_evento_con_fecha_fin_anterior_a_inicio_devuelve_400() throws Exception {
		String token = registrarYObtenerToken("cal3@ejemplo.com");
		CrearEventoRequest solicitud = new CrearEventoRequest(
				"Evento inválido",
				null,
				TipoEvento.CITA,
				Instant.parse("2026-11-25T16:00:00Z"),
				Instant.parse("2026-11-25T15:00:00Z"),
				false,
				null,
				null,
				null,
				null
		);

		mockMvc.perform(post("/api/eventos")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.mensaje").isNotEmpty());
	}

	@Test
	void crear_evento_en_fecha_pasada_devuelve_400() throws Exception {
		String token = registrarYObtenerToken("cal4@ejemplo.com");
		Instant hace1Hora = Instant.now().minusSeconds(3600);
		CrearEventoRequest solicitud = new CrearEventoRequest(
				"Evento pasado",
				null,
				TipoEvento.EVENTO,
				hace1Hora,
				hace1Hora.plusSeconds(3600),
				false,
				"America/Lima",
				null,
				null,
				null
		);

		mockMvc.perform(post("/api/eventos")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.mensaje").value(
						"No puedes programar un evento en una fecha u hora anterior a la actual."));
	}

	@Test
	void editar_evento_pasado_devuelve_400() throws Exception {
		String token = registrarYObtenerToken("cal5@ejemplo.com");
		String eventoId = crearEventoPrueba(token, "Evento para editar");

		ActualizarEventoRequest solicitudEdicion = new ActualizarEventoRequest(
				"Evento editado",
				null,
				TipoEvento.EVENTO,
				Instant.parse("2024-01-01T09:00:00Z"),
				Instant.parse("2024-01-01T10:00:00Z"),
				false,
				"America/Lima",
				null,
				null,
				null
		);

		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
						.put("/api/eventos/" + eventoId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitudEdicion)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.mensaje").value(
						"No puedes programar un evento en una fecha u hora anterior a la actual."));
	}
}
