package com.example.proyecto_calendario_de_eventos.service;

import com.example.proyecto_calendario_de_eventos.config.PropiedadesAplicacion;
import com.example.proyecto_calendario_de_eventos.dto.request.InicioSesionRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RecuperarContrasenaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RegistroUsuarioRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RestablecerContrasenaRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.AutenticacionResponse;
import com.example.proyecto_calendario_de_eventos.dto.response.MensajeResponse;
import com.example.proyecto_calendario_de_eventos.entity.TokenRecuperacionContrasena;
import com.example.proyecto_calendario_de_eventos.entity.TokenRefresco;
import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import com.example.proyecto_calendario_de_eventos.exception.ConflictoRecursoException;
import com.example.proyecto_calendario_de_eventos.exception.CredencialesInvalidasException;
import com.example.proyecto_calendario_de_eventos.exception.ReglaNegocioException;
import com.example.proyecto_calendario_de_eventos.mapper.UsuarioMapper;
import com.example.proyecto_calendario_de_eventos.repository.CategoriaRepository;
import com.example.proyecto_calendario_de_eventos.repository.TokenRecuperacionContrasenaRepository;
import com.example.proyecto_calendario_de_eventos.repository.TokenRefrescoRepository;
import com.example.proyecto_calendario_de_eventos.repository.UsuarioRepository;
import com.example.proyecto_calendario_de_eventos.security.ControladorIntentosAutenticacion;
import com.example.proyecto_calendario_de_eventos.security.ProveedorJwt;
import com.example.proyecto_calendario_de_eventos.service.impl.AutenticacionServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AutenticacionServiceImplTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private CategoriaRepository categoriaRepository;
    @Mock private TokenRefrescoRepository tokenRefrescoRepository;
    @Mock private TokenRecuperacionContrasenaRepository tokenRecuperacionRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private ProveedorJwt proveedorJwt;
    @Mock private ControladorIntentosAutenticacion controladorIntentos;
    @Mock private UsuarioMapper usuarioMapper;

    private final Clock reloj = Clock.fixed(Instant.parse("2026-01-01T12:00:00Z"), ZoneOffset.UTC);

    private PropiedadesAplicacion propiedades;
    private AutenticacionServiceImpl autenticacionService;
    private HttpServletResponse mockRespuesta;
    private HttpServletRequest mockSolicitud;

    @BeforeEach
    void configurar() {
        propiedades = new PropiedadesAplicacion();
        propiedades.getJwt().setSecreto("secreto-de-prueba-suficientemente-largo-para-hmac-sha256-2026");
        propiedades.getJwt().setExpiracionAccesoMs(900_000L);
        propiedades.getJwt().setExpiracionRefreshMs(604_800_000L);
        propiedades.getCookie().setSegura(false);
        propiedades.getRecuperacion().setExpiracionMs(1_800_000L);

        autenticacionService = new AutenticacionServiceImpl(
                usuarioRepository,
                categoriaRepository,
                tokenRefrescoRepository,
                tokenRecuperacionRepository,
                passwordEncoder,
                proveedorJwt,
                controladorIntentos,
                propiedades,
                usuarioMapper,
                reloj
        );

        mockRespuesta = mock(HttpServletResponse.class);
        mockSolicitud = mock(HttpServletRequest.class);
    }

    private Usuario crearUsuarioPrueba() {
        Usuario usuario = new Usuario();
        usuario.setNombres("Juan");
        usuario.setApellidos("Pérez");
        usuario.setCorreo("juan@ejemplo.com");
        usuario.setCorreoNormalizado("juan@ejemplo.com");
        usuario.setContrasenaHash("$2a$10$hash");
        usuario.setActivo(true);
        try {
            var campo = Usuario.class.getDeclaredField("id");
            campo.setAccessible(true);
            campo.set(usuario, UUID.randomUUID());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return usuario;
    }

    @Test
    void registrar_exitoso_devuelve_respuesta_autenticacion() {
        RegistroUsuarioRequest solicitud = new RegistroUsuarioRequest(
                "Juan", "Pérez", "juan@ejemplo.com", "Contrasena1!", "Contrasena1!");

        when(usuarioRepository.existsByCorreoNormalizado("juan@ejemplo.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hash");
        Usuario guardado = crearUsuarioPrueba();
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(guardado);
        when(proveedorJwt.generarTokenAcceso(any(Usuario.class))).thenReturn("token.acceso.prueba");
        when(tokenRefrescoRepository.save(any(TokenRefresco.class))).thenAnswer(i -> i.getArgument(0));
        when(usuarioMapper.aRespuesta(any(Usuario.class))).thenReturn(null);

        AutenticacionResponse resultado = autenticacionService.registrar(solicitud, mockRespuesta);

        assertThat(resultado.tokenAcceso()).isEqualTo("token.acceso.prueba");
        assertThat(resultado.tipoToken()).isEqualTo("Bearer");
        verify(usuarioRepository).save(any(Usuario.class));
        verify(mockRespuesta).addCookie(any());
    }

    @Test
    void registrar_lanza_excepcion_si_contrasenas_no_coinciden() {
        RegistroUsuarioRequest solicitud = new RegistroUsuarioRequest(
                "Juan", "Pérez", "juan@ejemplo.com", "Contrasena1!", "Diferente1!");

        assertThatThrownBy(() -> autenticacionService.registrar(solicitud, mockRespuesta))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("contraseñas");

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void registrar_lanza_excepcion_si_correo_ya_existe() {
        RegistroUsuarioRequest solicitud = new RegistroUsuarioRequest(
                "Juan", "Pérez", "juan@ejemplo.com", "Contrasena1!", "Contrasena1!");
        when(usuarioRepository.existsByCorreoNormalizado("juan@ejemplo.com")).thenReturn(true);

        assertThatThrownBy(() -> autenticacionService.registrar(solicitud, mockRespuesta))
                .isInstanceOf(ConflictoRecursoException.class);

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void iniciarSesion_exitoso_devuelve_token() {
        InicioSesionRequest solicitud = new InicioSesionRequest("juan@ejemplo.com", "Contrasena1!");
        Usuario usuario = crearUsuarioPrueba();

        when(usuarioRepository.findByCorreoNormalizado("juan@ejemplo.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("Contrasena1!", usuario.getContrasenaHash())).thenReturn(true);
        when(proveedorJwt.generarTokenAcceso(usuario)).thenReturn("token.acceso.login");
        when(tokenRefrescoRepository.save(any(TokenRefresco.class))).thenAnswer(i -> i.getArgument(0));
        when(usuarioMapper.aRespuesta(usuario)).thenReturn(null);

        AutenticacionResponse resultado = autenticacionService.iniciarSesion(solicitud, mockRespuesta);

        assertThat(resultado.tokenAcceso()).isEqualTo("token.acceso.login");
        verify(controladorIntentos).limpiarIntentosInicioSesion("juan@ejemplo.com");
    }

    @Test
    void iniciarSesion_lanza_excepcion_si_usuario_no_existe() {
        InicioSesionRequest solicitud = new InicioSesionRequest("noexiste@ejemplo.com", "Contrasena1!");
        when(usuarioRepository.findByCorreoNormalizado("noexiste@ejemplo.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> autenticacionService.iniciarSesion(solicitud, mockRespuesta))
                .isInstanceOf(CredencialesInvalidasException.class);

        verify(controladorIntentos).registrarFalloInicioSesion("noexiste@ejemplo.com");
    }

    @Test
    void iniciarSesion_lanza_excepcion_si_contrasena_incorrecta() {
        InicioSesionRequest solicitud = new InicioSesionRequest("juan@ejemplo.com", "Incorrecta1!");
        Usuario usuario = crearUsuarioPrueba();

        when(usuarioRepository.findByCorreoNormalizado("juan@ejemplo.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("Incorrecta1!", usuario.getContrasenaHash())).thenReturn(false);

        assertThatThrownBy(() -> autenticacionService.iniciarSesion(solicitud, mockRespuesta))
                .isInstanceOf(CredencialesInvalidasException.class);

        verify(controladorIntentos).registrarFalloInicioSesion("juan@ejemplo.com");
    }

    @Test
    void restablecerContrasena_lanza_excepcion_si_contrasenas_no_coinciden() {
        RestablecerContrasenaRequest solicitud = new RestablecerContrasenaRequest(
                "token-valido", "Nueva1!", "Diferente1!");

        assertThatThrownBy(() -> autenticacionService.restablecerContrasena(solicitud))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("contraseñas");
    }

    @Test
    void restablecerContrasena_lanza_excepcion_si_token_no_existe() {
        RestablecerContrasenaRequest solicitud = new RestablecerContrasenaRequest(
                "token-inexistente", "Nueva1!", "Nueva1!");
        when(tokenRecuperacionRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> autenticacionService.restablecerContrasena(solicitud))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("enlace");
    }

    @Test
    void restablecerContrasena_lanza_excepcion_si_token_ya_utilizado() {
        RestablecerContrasenaRequest solicitud = new RestablecerContrasenaRequest(
                "token-usado", "Nueva1!", "Nueva1!");

        TokenRecuperacionContrasena token = new TokenRecuperacionContrasena();
        token.setUtilizado(true);
        token.setFechaExpiracion(Instant.now(reloj).plusSeconds(3600));
        when(tokenRecuperacionRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> autenticacionService.restablecerContrasena(solicitud))
                .isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    void restablecerContrasena_exitoso_actualiza_contrasena_y_revoca_tokens() {
        RestablecerContrasenaRequest solicitud = new RestablecerContrasenaRequest(
                "token-valido", "Nueva1!", "Nueva1!");

        Usuario usuario = crearUsuarioPrueba();
        TokenRecuperacionContrasena token = new TokenRecuperacionContrasena();
        token.setUtilizado(false);
        token.setFechaExpiracion(Instant.now(reloj).plusSeconds(3600));
        token.setUsuario(usuario);

        when(tokenRecuperacionRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("Nueva1!")).thenReturn("$2a$10$nuevohash");
        when(usuarioRepository.save(any())).thenReturn(usuario);
        when(tokenRecuperacionRepository.save(any())).thenReturn(token);

        MensajeResponse resultado = autenticacionService.restablecerContrasena(solicitud);

        assertThat(resultado.mensaje()).contains("restablecida");
        verify(tokenRefrescoRepository).revocarActivosPorUsuario(usuario.getId());
        assertThat(token.isUtilizado()).isTrue();
    }

    @Test
    void solicitarRecuperacion_siempre_devuelve_mismo_mensaje() {
        when(usuarioRepository.findByCorreoNormalizado("noexiste@ejemplo.com")).thenReturn(Optional.empty());

        MensajeResponse resultado = autenticacionService.solicitarRecuperacion(
                new RecuperarContrasenaRequest("noexiste@ejemplo.com"));

        assertThat(resultado.mensaje()).contains("Si el correo");
    }
}
