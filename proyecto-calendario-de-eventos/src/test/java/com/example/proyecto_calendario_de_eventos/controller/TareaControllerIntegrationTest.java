package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CambiarEstadoTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RegistroUsuarioRequest;
import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.enums.PrioridadTarea;
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
import java.time.temporal.ChronoUnit;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
class TareaControllerIntegrationTest {

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
				"Usuario", "Tareas", correo, "Test1234!", "Test1234!");
		MvcResult resultado = mockMvc.perform(post("/api/auth/registro")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andReturn();
		return objectMapper.readTree(resultado.getResponse().getContentAsString())
				.get("tokenAcceso").asText();
	}

	private String crearTarea(String token, String titulo) throws Exception {
		CrearTareaRequest solicitud = new CrearTareaRequest(
				titulo,
				null,
				PrioridadTarea.MEDIA,
				EstadoTarea.PENDIENTE,
				0,
				Instant.now().plus(1, ChronoUnit.DAYS),
				null,
				null
		);
		MvcResult resultado = mockMvc.perform(post("/api/tareas")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(resultado.getResponse().getContentAsString()).get("id").asText();
	}

	@Test
	void crear_tarea_con_fecha_limite_pasada_devuelve_400() throws Exception {
		String token = registrarYObtenerToken("t5@ejemplo.com");
		Instant fechaPasada = Instant.now().minusSeconds(3600);
		CrearTareaRequest solicitud = new CrearTareaRequest(
				"Tarea pasada",
				null,
				PrioridadTarea.ALTA,
				null,
				null,
				fechaPasada,
				null,
				null
		);

		mockMvc.perform(post("/api/tareas")
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(solicitud)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.mensaje").value("La fecha límite no puede ser anterior a la fecha y hora actual."));
	}

	@Test
	void editar_tarea_pasada_devuelve_400() throws Exception {
		String token = registrarYObtenerToken("t6@ejemplo.com");
		String tareaId = crearTarea(token, "Tarea para editar"); // need helper method to create directly maybe use crearTarea?
		Instant fechaPasada = Instant.now().minusSeconds(3600);
		ActualizarTareaRequest solicitud = new ActualizarTareaRequest(
				"Tarea editada",
				null,
				PrioridadTarea.ALTA,
				EstadoTarea.PENDIENTE,
				0,
				fechaPasada,
				null,
				null
		);

		mockMvc.perform(put("/api/tareas/" + tareaId)
					.header("Authorization", "Bearer " + token)
					.contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(solicitud)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.mensaje").value("La fecha límite no puede ser anterior a la fecha y hora actual."));
	}

	@Test
	void crear_tarea_devuelve_201() throws Exception {
		String token = registrarYObtenerToken("t1@ejemplo.com");
		CrearTareaRequest solicitud = new CrearTareaRequest(
				"Preparar presentación",
				"Revisar diapositivas",
				PrioridadTarea.ALTA,
				EstadoTarea.PENDIENTE,
				50,
				Instant.now().plus(2, ChronoUnit.DAYS),
				null,
				null
		);

		mockMvc.perform(post("/api/tareas")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.titulo").value("Preparar presentación"))
				.andExpect(jsonPath("$.estado").value("PENDIENTE"))
				.andExpect(jsonPath("$.porcentajeProgreso").value(0))
				.andExpect(jsonPath("$.vencida").value(false));
	}

	@Test
	void marcar_tarea_completada_fija_progreso_en_100() throws Exception {
		String token = registrarYObtenerToken("t2@ejemplo.com");
		CrearTareaRequest crear = new CrearTareaRequest(
				"Enviar informe",
				null,
				PrioridadTarea.URGENTE,
				null,
				null,
				Instant.now().plus(1, ChronoUnit.DAYS),
				null,
				null
		);

		MvcResult resCrear = mockMvc.perform(post("/api/tareas")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(crear)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.vencida").value(false))
				.andReturn();

		String tareaId = objectMapper.readTree(resCrear.getResponse().getContentAsString()).get("id").asText();

		CambiarEstadoTareaRequest completar = new CambiarEstadoTareaRequest(EstadoTarea.COMPLETADA, 20);

		mockMvc.perform(patch("/api/tareas/{id}/estado", tareaId)
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(completar)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.estado").value("COMPLETADA"))
				.andExpect(jsonPath("$.porcentajeProgreso").value(100))
				.andExpect(jsonPath("$.vencida").value(false))
				.andExpect(jsonPath("$.fechaCompletada").isNotEmpty());
	}

	@Test
	void filtrar_tareas_por_estado_y_prioridad() throws Exception {
		String token = registrarYObtenerToken("t3@ejemplo.com");
		CrearTareaRequest t1 = new CrearTareaRequest("Tarea baja", null, PrioridadTarea.BAJA, null, null, null, null, null);
		CrearTareaRequest t2 = new CrearTareaRequest("Tarea urgente", null, PrioridadTarea.URGENTE, EstadoTarea.EN_PROGRESO, 40, null, null, null);

		mockMvc.perform(post("/api/tareas")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(t1)));

		mockMvc.perform(post("/api/tareas")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(t2)));

		mockMvc.perform(get("/api/tareas")
						.header("Authorization", "Bearer " + token)
						.param("estado", "EN_PROGRESO")
						.param("prioridad", "URGENTE"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].titulo").value("Tarea urgente"));
	}

	@Test
	void usuario_no_puede_acceder_ni_eliminar_tarea_de_otro() throws Exception {
		String tokenDueno = registrarYObtenerToken("td@ejemplo.com");
		String tokenOtro = registrarYObtenerToken("to@ejemplo.com");
		CrearTareaRequest crear = new CrearTareaRequest("Tarea privada", null, PrioridadTarea.MEDIA, null, null, null, null, null);

		MvcResult res = mockMvc.perform(post("/api/tareas")
						.header("Authorization", "Bearer " + tokenDueno)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(crear)))
				.andReturn();
		String tareaId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText();

		mockMvc.perform(get("/api/tareas/{id}", tareaId)
						.header("Authorization", "Bearer " + tokenOtro))
				.andExpect(status().isNotFound());

		mockMvc.perform(delete("/api/tareas/{id}", tareaId)
						.header("Authorization", "Bearer " + tokenOtro))
				.andExpect(status().isNotFound());
	}

	@Test
	void crear_tarea_invalida_devuelve_400() throws Exception {
		String token = registrarYObtenerToken("t4@ejemplo.com");
		CrearTareaRequest invalida = new CrearTareaRequest("", null, PrioridadTarea.ALTA, null, 150, null, null, null);

		mockMvc.perform(post("/api/tareas")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(invalida)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.detalles.titulo").isNotEmpty())
				.andExpect(jsonPath("$.detalles.porcentajeProgreso").isNotEmpty());
	}
}
