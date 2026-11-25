package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.CrearEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearRecordatorioRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RegistroUsuarioRequest;
import com.example.proyecto_calendario_de_eventos.entity.Recordatorio;
import com.example.proyecto_calendario_de_eventos.enums.PrioridadTarea;
import com.example.proyecto_calendario_de_eventos.enums.TipoEvento;
import com.example.proyecto_calendario_de_eventos.repository.RecordatorioRepository;
import com.example.proyecto_calendario_de_eventos.service.impl.ProcesadorRecordatoriosJob;
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
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
class RecordatorioYNotificacionIntegrationTest {

	@Autowired
	private WebApplicationContext contextoWeb;

	@Autowired
	private RecordatorioRepository recordatorioRepository;

	@Autowired
	private ProcesadorRecordatoriosJob procesadorRecordatoriosJob;

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
				"Usuario", "Recordatorios", correo, "Test1234!", "Test1234!");
		MvcResult resultado = mockMvc.perform(post("/api/auth/registro")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andReturn();
		return objectMapper.readTree(resultado.getResponse().getContentAsString())
				.get("tokenAcceso").asText();
	}

	private String crearEventoFuturo(String token, String titulo) throws Exception {
		Instant inicio = Instant.now().plus(2, ChronoUnit.DAYS);
		CrearEventoRequest solicitud = new CrearEventoRequest(
				titulo, null, TipoEvento.EVENTO,
				inicio, inicio.plus(1, ChronoUnit.HOURS),
				false, "America/Lima", null, "#4F46E5", null
		);
		MvcResult res = mockMvc.perform(post("/api/eventos")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText();
	}

	private String crearTareaFutura(String token, String titulo) throws Exception {
		CrearTareaRequest solicitud = new CrearTareaRequest(
				titulo, null, PrioridadTarea.ALTA, null, null,
				Instant.now().plus(1, ChronoUnit.DAYS), null, null
		);
		MvcResult res = mockMvc.perform(post("/api/tareas")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andExpect(status().isCreated())
				.andReturn();
		return objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText();
	}

	@Test
	void crear_multiples_recordatorios_y_evitar_duplicados() throws Exception {
		String token = registrarYObtenerToken("rec1@ejemplo.com");
		String eventoId = crearEventoFuturo(token, "Reunión importante");

		CrearRecordatorioRequest r1 = new CrearRecordatorioRequest(UUID.fromString(eventoId), null, 15, "APLICACION");
		CrearRecordatorioRequest r2 = new CrearRecordatorioRequest(UUID.fromString(eventoId), null, 60, "APLICACION");

		mockMvc.perform(post("/api/recordatorios")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(r1)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.minutosAnticipacion").value(15))
				.andExpect(jsonPath("$.tituloReferencia").value("Reunión importante"));

		mockMvc.perform(post("/api/recordatorios")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(r2)))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/api/recordatorios")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(r1)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.mensaje").value("Ya existe un recordatorio configurado con esa misma anticipación para este evento."));
	}

	@Test
	void crear_recordatorio_con_activacion_pasada_devuelve_400() throws Exception {
		String token = registrarYObtenerToken("rec2@ejemplo.com");
		String tareaId = crearTareaFutura(token, "Entrega próxima");

		CrearRecordatorioRequest rPasado = new CrearRecordatorioRequest(null, UUID.fromString(tareaId), 43200, "APLICACION");

		mockMvc.perform(post("/api/recordatorios")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(rPasado)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.mensaje").value("La fecha de activación del recordatorio ya pasó. Elige una anticipación menor o una fecha límite futura."));
	}

	@Test
	void procesador_genera_notificacion_y_usuario_puede_leer_y_eliminar() throws Exception {
		String token = registrarYObtenerToken("rec3@ejemplo.com");
		String tareaId = crearTareaFutura(token, "Revisar presupuesto");

		CrearRecordatorioRequest req = new CrearRecordatorioRequest(null, UUID.fromString(tareaId), 30, "APLICACION");
		MvcResult resRec = mockMvc.perform(post("/api/recordatorios")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(req)))
				.andExpect(status().isCreated())
				.andReturn();

		UUID recId = UUID.fromString(objectMapper.readTree(resRec.getResponse().getContentAsString()).get("id").asText());
		Recordatorio rec = recordatorioRepository.findById(recId).orElseThrow();
		rec.setFechaActivacion(Instant.now().minusSeconds(60));
		recordatorioRepository.saveAndFlush(rec);

		procesadorRecordatoriosJob.procesarRecordatoriosPendientes();
		procesadorRecordatoriosJob.procesarRecordatoriosPendientes();

		MvcResult resNotif = mockMvc.perform(get("/api/notificaciones")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].leida").value(false))
				.andExpect(jsonPath("$[0].titulo").value("Recordatorio de tarea: Revisar presupuesto"))
				.andReturn();

		String notifId = objectMapper.readTree(resNotif.getResponse().getContentAsString()).get(0).get("id").asText();

		mockMvc.perform(patch("/api/notificaciones/{id}/leida", notifId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.leida").value(true));

		mockMvc.perform(delete("/api/notificaciones/{id}", notifId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/notificaciones")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(0));
	}
}
