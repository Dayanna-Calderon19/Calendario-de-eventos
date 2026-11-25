package com.example.proyecto_calendario_de_eventos.service.impl;

import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarConfiguracionRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.ActualizarPerfilRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.ConfiguracionUsuarioResponse;
import com.example.proyecto_calendario_de_eventos.dto.response.UsuarioResponse;
import com.example.proyecto_calendario_de_eventos.entity.ConfiguracionUsuario;
import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import com.example.proyecto_calendario_de_eventos.exception.RecursoNoEncontradoException;
import com.example.proyecto_calendario_de_eventos.exception.ReglaNegocioException;
import com.example.proyecto_calendario_de_eventos.mapper.UsuarioMapper;
import com.example.proyecto_calendario_de_eventos.repository.ConfiguracionUsuarioRepository;
import com.example.proyecto_calendario_de_eventos.repository.UsuarioRepository;
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ConfiguracionUsuarioRepository configuracionUsuarioRepository;
    private final UsuarioMapper usuarioMapper;

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPerfil(UsuarioAutenticado usuarioActual) {
        Usuario usuario = cargarUsuario(usuarioActual.getId());
        return usuarioMapper.aRespuesta(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponse actualizarPerfil(ActualizarPerfilRequest solicitud, UsuarioAutenticado usuarioActual) {
        Usuario usuario = cargarUsuario(usuarioActual.getId());
        usuario.setNombres(solicitud.nombres().trim());
        usuario.setApellidos(solicitud.apellidos().trim());
        Usuario guardado = usuarioRepository.save(usuario);
        return usuarioMapper.aRespuesta(guardado);
    }

    @Override
    @Transactional
    public ConfiguracionUsuarioResponse obtenerConfiguracion(UsuarioAutenticado usuarioActual) {
        Usuario usuario = cargarUsuario(usuarioActual.getId());
        ConfiguracionUsuario configuracion = configuracionUsuarioRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> crearConfiguracionPorDefecto(usuario));
        return aRespuestaConfiguracion(configuracion);
    }

    @Override
    @Transactional
    public ConfiguracionUsuarioResponse actualizarConfiguracion(
            ActualizarConfiguracionRequest solicitud,
            UsuarioAutenticado usuarioActual) {
        String zonaHoraria = solicitud.zonaHoraria().trim();
        validarZonaHoraria(zonaHoraria);

        Usuario usuario = cargarUsuario(usuarioActual.getId());
        ConfiguracionUsuario configuracion = configuracionUsuarioRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> crearConfiguracionPorDefecto(usuario));

        configuracion.setZonaHoraria(zonaHoraria);
        configuracion.setFormatoHorario(solicitud.formatoHorario());
        configuracion.setPrimerDiaSemana(solicitud.primerDiaSemana());
        configuracion.setVistaPreferida(solicitud.vistaPreferida());
        configuracion.setColorPredeterminado(solicitud.colorPredeterminado().toLowerCase());
        configuracion.setNotificacionesActivas(Boolean.TRUE.equals(solicitud.notificacionesActivas()));

        ConfiguracionUsuario guardada = configuracionUsuarioRepository.save(configuracion);
        return aRespuestaConfiguracion(guardada);
    }

    @Override
    @Transactional
    public void eliminarCuenta(UsuarioAutenticado usuarioActual) {
        Usuario usuario = cargarUsuario(usuarioActual.getId());
        usuarioRepository.delete(usuario);
    }

    private ConfiguracionUsuario crearConfiguracionPorDefecto(Usuario usuario) {
        ConfiguracionUsuario nueva = new ConfiguracionUsuario();
        nueva.setUsuario(usuario);
        return configuracionUsuarioRepository.save(nueva);
    }

    private void validarZonaHoraria(String zonaHoraria) {
        try {
            ZoneId.of(zonaHoraria);
        } catch (DateTimeException ex) {
            throw new ReglaNegocioException("La zona horaria seleccionada no es válida.");
        }
    }

    private ConfiguracionUsuarioResponse aRespuestaConfiguracion(ConfiguracionUsuario c) {
        return new ConfiguracionUsuarioResponse(
                c.getZonaHoraria(),
                c.getFormatoHorario(),
                c.getPrimerDiaSemana(),
                c.getVistaPreferida(),
                c.getColorPredeterminado(),
                c.isNotificacionesActivas()
        );
    }

    private Usuario cargarUsuario(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));
    }
}
