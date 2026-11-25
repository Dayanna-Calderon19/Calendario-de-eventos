package com.example.proyecto_calendario_de_eventos.service;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarPerfilRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.UsuarioResponse;
import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import com.example.proyecto_calendario_de_eventos.exception.RecursoNoEncontradoException;
import com.example.proyecto_calendario_de_eventos.mapper.UsuarioMapper;
import com.example.proyecto_calendario_de_eventos.repository.UsuarioRepository;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.impl.UsuarioServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private UsuarioMapper usuarioMapper;

    @InjectMocks
    private UsuarioServiceImpl usuarioService;

    private Usuario crearUsuarioPrueba(UUID id) {
        Usuario usuario = new Usuario();
        usuario.setNombres("María");
        usuario.setApellidos("García");
        usuario.setCorreo("maria@ejemplo.com");
        usuario.setCorreoNormalizado("maria@ejemplo.com");
        usuario.setContrasenaHash("$2a$10$hash");
        usuario.setActivo(true);
        try {
            var campo = Usuario.class.getDeclaredField("id");
            campo.setAccessible(true);
            campo.set(usuario, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return usuario;
    }

    private UsuarioAutenticado crearAutenticado(UUID id) {
        return new UsuarioAutenticado(crearUsuarioPrueba(id));
    }

    @Test
    void obtenerPerfil_devuelve_datos_del_usuario() {
        UUID id = UUID.randomUUID();
        Usuario usuario = crearUsuarioPrueba(id);
        UsuarioResponse respuestaEsperada = new UsuarioResponse(id, "María", "García",
                "maria@ejemplo.com", true, Instant.now());

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(usuarioMapper.aRespuesta(usuario)).thenReturn(respuestaEsperada);

        UsuarioResponse resultado = usuarioService.obtenerPerfil(crearAutenticado(id));

        assertThat(resultado.nombres()).isEqualTo("María");
        assertThat(resultado.correo()).isEqualTo("maria@ejemplo.com");
    }

    @Test
    void obtenerPerfil_lanza_excepcion_si_usuario_no_existe() {
        UUID id = UUID.randomUUID();
        when(usuarioRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.obtenerPerfil(crearAutenticado(id)))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void actualizarPerfil_actualiza_nombres_y_apellidos() {
        UUID id = UUID.randomUUID();
        Usuario usuario = crearUsuarioPrueba(id);
        ActualizarPerfilRequest solicitud = new ActualizarPerfilRequest("Pedro", "López");
        UsuarioResponse respuestaEsperada = new UsuarioResponse(id, "Pedro", "López",
                "maria@ejemplo.com", true, Instant.now());

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);
        when(usuarioMapper.aRespuesta(any(Usuario.class))).thenReturn(respuestaEsperada);

        UsuarioResponse resultado = usuarioService.actualizarPerfil(solicitud, crearAutenticado(id));

        assertThat(resultado.nombres()).isEqualTo("Pedro");
        verify(usuarioRepository).save(usuario);
    }
}
