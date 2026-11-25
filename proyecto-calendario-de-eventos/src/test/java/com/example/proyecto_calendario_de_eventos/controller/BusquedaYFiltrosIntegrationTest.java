package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.CrearCategoriaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearEventoRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.CrearTareaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RegistroUsuarioRequest;
import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.enums.PrioridadTarea;
import com.example.proyecto_calendario_de_eventos.enums.TipoEvento;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
class BusquedaYFiltrosIntegrationTest {

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
				"Usuario", "Filtros", correo, "Test1234!", "Test1234!");
		MvcResult resultado = mockMvc.perform(post("/api/auth/registro")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(solicitud)))
				.andReturn();
		return objectMapper.readTree(resultado.getResponse().getContentAsString())
				.get("tokenAcceso").asText();
	}

	private UUID crearCategoria(String token, String nombre, String color) throws Exception {
		CrearCategoriaRequest req = new CrearCategoriaRequest(nombre, color);
		MvcResult res = mockMvc.perform(post("/api/categorias")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(req)))
				.andExpect(status().isCreated())
				.andReturn();
		return UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText());
	}

	@Test
	void filtrar_eventos_por_texto_tipo_categoria_y_rango_de_fechas() throws Exception {
		String token = registrarYObtenerToken("filtros.eventos@ejemplo.com");
		UUID catTrabajo = crearCategoria(token, "Proyecto X", "#4F46E5");
		UUID catSalud = crearCategoria(token, "Salud", "#10B981");

		Instant base = Instant.now().plus(3, ChronoUnit.DAYS);

		CrearEventoRequest e1 = new CrearEventoRequest(
				"Reunión de arquitectura",
				"Revisar microservicios y seguridad",
				TipoEvento.EVENTO,
				base,
				base.plus(1, ChronoUnit.HOURS),
				false,
				"America/Lima",
				"Sala A",
				"#4F46E5",
				catTrabajo
		);
		CrearEventoRequest e2 = new CrearEventoRequest(
				"Control médico",
				"Chequeo anual preventivo",
				TipoEvento.CITA,
				base.plus(5, ChronoUnit.DAYS),
				base.plus(5, ChronoUnit.DAYS).plus(1, ChronoUnit.HOURS),
				false,
				"America/Lima",
				"Clínica",
				"#10B981",
				catSalud
		);

		mockMvc.perform(post("/api/eventos")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(e1)))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/api/eventos")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(e2)))
				.andExpect(status().isCreated());

		// Búsqueda por texto en descripción + tipo + categoría + rango
		mockMvc.perform(get("/api/eventos")
						.header("Authorization", "Bearer " + token)
						.param("busqueda", "microservicios")
						.param("tipo", "EVENTO")
						.param("categoriaId", catTrabajo.toString())
						.param("desde", base.minus(1, ChronoUnit.HOURS).toString())
						.param("hasta", base.plus(2, ChronoUnit.DAYS).toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].titulo").value("Reunión de arquitectura"));

		// Rango inválido devuelve 400
		mockMvc.perform(get("/api/eventos")
						.header("Authorization", "Bearer " + token)
						.param("desde", base.plus(2, ChronoUnit.DAYS).toString())
						.param("hasta", base.toString()))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.mensaje").value("La fecha hasta debe ser igual o posterior a la fecha desde."));
	}

	@Test
	void filtrar_tareas_por_texto_estado_prioridad_categoria_y_fechas() throws Exception {
		String token = registrarYObtenerToken("filtros.tareas@ejemplo.com");
		UUID catPersonal = crearCategoria(token, "Hogar", "#F59E0B");

		Instant manana = Instant.now().plus(1, ChronoUnit.DAYS);
		Instant enDiezDias = Instant.now().plus(10, ChronoUnit.DAYS);

		CrearTareaRequest t1 = new CrearTareaRequest(
				"Preparar presentación",
				"Incluir métricas de rendimiento del trimestre",
				PrioridadTarea.ALTA,
				EstadoTarea.EN_PROGRESO,
				40,
				manana,
				null,
				catPersonal
		);
		CrearTareaRequest t2 = new CrearTareaRequest(
				"Comprar suministros",
				"Hojas y marcadores",
				PrioridadTarea.BAJA,
				EstadoTarea.PENDIENTE,
				0,
				enDiezDias,
				null,
				null
		);

		mockMvc.perform(post("/api/tareas")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(t1)))
				.andExpect(status().isCreated());

		mockMvc.perform(post("/api/tareas")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(t2)))
				.andExpect(status().isCreated());

		// Combinar búsqueda en descripción + estado + prioridad + categoría + rango
		mockMvc.perform(get("/api/tareas")
						.header("Authorization", "Bearer " + token)
						.param("busqueda", "rendimiento")
						.param("estado", "EN_PROGRESO")
						.param("prioridad", "ALTA")
						.param("categoriaId", catPersonal.toString())
						.param("desde", Instant.now().toString())
						.param("hasta", manana.plus(1, ChronoUnit.DAYS).toString()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].titulo").value("Preparar presentación"));
	}
}
