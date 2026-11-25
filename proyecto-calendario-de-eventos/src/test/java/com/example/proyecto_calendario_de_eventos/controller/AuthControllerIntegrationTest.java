package com.example.proyecto_calendario_de_eventos.controller;

import com.example.proyecto_calendario_de_eventos.dto.request.InicioSesionRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RegistroUsuarioRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private WebApplicationContext contextoWeb;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String CORREO = "integracion@ejemplo.com";
    private static final String CONTRASENA = "Test1234!";

    @BeforeEach
    void configurar() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(contextoWeb)
                .apply(springSecurity())
                .build();
    }

    private void registrarUsuario() throws Exception {
        RegistroUsuarioRequest solicitud = new RegistroUsuarioRequest(
                "Test", "Usuario", CORREO, CONTRASENA, CONTRASENA);
        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solicitud)))
                .andExpect(status().isCreated());
    }

    @Test
    void registro_devuelve_201_con_token_de_acceso() throws Exception {
        RegistroUsuarioRequest solicitud = new RegistroUsuarioRequest(
                "Test", "Usuario", CORREO, CONTRASENA, CONTRASENA);

        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solicitud)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tokenAcceso").isNotEmpty())
                .andExpect(jsonPath("$.tipoToken").value("Bearer"))
                .andExpect(jsonPath("$.usuario.correo").value(CORREO));
    }

    @Test
    void registro_devuelve_409_si_correo_ya_existe() throws Exception {
        registrarUsuario();

        RegistroUsuarioRequest solicitud = new RegistroUsuarioRequest(
                "Otro", "Usuario", CORREO, CONTRASENA, CONTRASENA);

        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solicitud)))
                .andExpect(status().isConflict());
    }

    @Test
    void registro_devuelve_400_si_datos_invalidos() throws Exception {
        RegistroUsuarioRequest solicitud = new RegistroUsuarioRequest(
                "", "", "correo-invalido", "123", "123");

        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solicitud)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void iniciar_sesion_devuelve_200_con_token() throws Exception {
        registrarUsuario();

        InicioSesionRequest solicitud = new InicioSesionRequest(CORREO, CONTRASENA);

        mockMvc.perform(post("/api/auth/iniciar-sesion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solicitud)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenAcceso").isNotEmpty())
                .andExpect(jsonPath("$.usuario.correo").value(CORREO));
    }

    @Test
    void iniciar_sesion_devuelve_401_con_credenciales_incorrectas() throws Exception {
        registrarUsuario();

        InicioSesionRequest solicitud = new InicioSesionRequest(CORREO, "ContraseñaIncorrecta1!");

        mockMvc.perform(post("/api/auth/iniciar-sesion")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solicitud)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void recuperar_contrasena_siempre_devuelve_200() throws Exception {
        mockMvc.perform(post("/api/auth/recuperar-contrasena")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"noexiste@ejemplo.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").isNotEmpty());
    }

    @Test
    void preflight_cors_permite_origen_local() throws Exception {
        mockMvc.perform(options("/api/auth/registro")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
    }
}
