package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarConfiguracionRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarPerfilRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RegistroUsuarioRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
class UsuarioControllerIntegrationTest {

    @Autowired
    private WebApplicationContext contextoWeb;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String CORREO = "perfil@ejemplo.com";
    private static final String CONTRASENA = "Test1234!";

    @BeforeEach
    void configurar() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(contextoWeb)
                .apply(springSecurity())
                .build();
    }

    private String obtenerTokenAcceso() throws Exception {
        RegistroUsuarioRequest solicitud = new RegistroUsuarioRequest(
                "Perfil", "Usuario", CORREO, CONTRASENA, CONTRASENA);

        MvcResult resultado = mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solicitud)))
                .andReturn();

        String cuerpo = resultado.getResponse().getContentAsString();
        return objectMapper.readTree(cuerpo).get("tokenAcceso").asText();
    }

    @Test
    void obtener_perfil_sin_token_devuelve_401() throws Exception {
        mockMvc.perform(get("/api/usuarios/perfil"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void obtener_perfil_con_token_devuelve_datos() throws Exception {
        String token = obtenerTokenAcceso();

        mockMvc.perform(get("/api/usuarios/perfil")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value(CORREO))
                .andExpect(jsonPath("$.nombres").value("Perfil"));
    }

    @Test
    void actualizar_perfil_con_token_actualiza_datos() throws Exception {
        String token = obtenerTokenAcceso();
        ActualizarPerfilRequest solicitud = new ActualizarPerfilRequest("NuevoNombre", "NuevoApellido");

        mockMvc.perform(put("/api/usuarios/perfil")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solicitud)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombres").value("NuevoNombre"))
                .andExpect(jsonPath("$.apellidos").value("NuevoApellido"));
    }

    @Test
    void actualizar_perfil_sin_token_devuelve_401() throws Exception {
        ActualizarPerfilRequest solicitud = new ActualizarPerfilRequest("Nuevo", "Apellido");

        mockMvc.perform(put("/api/usuarios/perfil")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solicitud)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void obtener_y_actualizar_configuracion_con_token_funciona() throws Exception {
        String token = obtenerTokenAcceso();

        mockMvc.perform(get("/api/usuarios/configuracion")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.zonaHoraria").value("America/Lima"))
                .andExpect(jsonPath("$.formatoHorario").value("H24"));

        ActualizarConfiguracionRequest solicitud = new ActualizarConfiguracionRequest(
                "America/Bogota",
                "H12",
                "DOMINGO",
                "SEMANA",
                "#0891b2",
                false
        );

        mockMvc.perform(put("/api/usuarios/configuracion")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solicitud)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.zonaHoraria").value("America/Bogota"))
                .andExpect(jsonPath("$.formatoHorario").value("H12"))
                .andExpect(jsonPath("$.primerDiaSemana").value("DOMINGO"))
                .andExpect(jsonPath("$.vistaPreferida").value("SEMANA"))
                .andExpect(jsonPath("$.colorPredeterminado").value("#0891b2"))
                .andExpect(jsonPath("$.notificacionesActivas").value(false));
    }

    @Test
    void eliminar_cuenta_con_token_devuelve_204() throws Exception {
        String token = obtenerTokenAcceso();

        mockMvc.perform(delete("/api/usuarios/cuenta")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }
}
