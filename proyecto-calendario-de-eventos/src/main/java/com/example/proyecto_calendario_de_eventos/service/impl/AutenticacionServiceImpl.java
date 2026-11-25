package com.example.proyecto_calendario_de_eventos.service.impl;

import com.example.proyecto_calendario_de_eventos.config.PropiedadesAplicacion;
import com.example.proyecto_calendario_de_eventos.dto.request.InicioSesionRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RecuperarContrasenaRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RegistroUsuarioRequest;
import com.example.proyecto_calendario_de_eventos.dto.request.RestablecerContrasenaRequest;
import com.example.proyecto_calendario_de_eventos.dto.response.AutenticacionResponse;
import com.example.proyecto_calendario_de_eventos.dto.response.MensajeResponse;
import com.example.proyecto_calendario_de_eventos.entity.Categoria;
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
import com.example.proyecto_calendario_de_eventos.security.UsuarioAutenticado;
import com.example.proyecto_calendario_de_eventos.service.AutenticacionService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Instant;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutenticacionServiceImpl implements AutenticacionService {

    private static final String NOMBRE_COOKIE_REFRESCO = "refreshToken";
    private static final String TIPO_TOKEN = "Bearer";
    private static final String MENSAJE_RECUPERACION = "Si el correo está registrado, recibirás las instrucciones.";

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final TokenRefrescoRepository tokenRefrescoRepository;
    private final TokenRecuperacionContrasenaRepository tokenRecuperacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProveedorJwt proveedorJwt;
    private final ControladorIntentosAutenticacion controladorIntentos;
    private final PropiedadesAplicacion propiedades;
    private final UsuarioMapper usuarioMapper;
    private final Clock reloj;

    @Override
    @Transactional
    public AutenticacionResponse registrar(RegistroUsuarioRequest solicitud, HttpServletResponse respuesta) {
        if (!solicitud.contrasena().equals(solicitud.confirmacionContrasena())) {
            throw new ReglaNegocioException("Las contraseñas no coinciden.");
        }

        String correoNormalizado = normalizarCorreo(solicitud.correo());

        if (usuarioRepository.existsByCorreoNormalizado(correoNormalizado)) {
            throw new ConflictoRecursoException("Ya existe una cuenta con ese correo electrónico.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombres(solicitud.nombres().trim());
        usuario.setApellidos(solicitud.apellidos().trim());
        usuario.setCorreo(solicitud.correo().trim());
        usuario.setCorreoNormalizado(correoNormalizado);
        usuario.setContrasenaHash(passwordEncoder.encode(solicitud.contrasena()));
        usuario.setActivo(true);

        Usuario guardado = usuarioRepository.save(usuario);
        crearCategoriasPorDefecto(guardado);

        String tokenAcceso = proveedorJwt.generarTokenAcceso(guardado);
        String tokenRefrescoRaw = crearYPersistirTokenRefresco(guardado);
        agregarCookieRefresco(respuesta, tokenRefrescoRaw);

        long expiracionMs = propiedades.getJwt().getExpiracionAccesoMs();
        return new AutenticacionResponse(tokenAcceso, TIPO_TOKEN, expiracionMs, usuarioMapper.aRespuesta(guardado));
    }

    @Override
    @Transactional
    public AutenticacionResponse iniciarSesion(InicioSesionRequest solicitud, HttpServletResponse respuesta) {
        String correoNormalizado = normalizarCorreo(solicitud.correo());

        controladorIntentos.verificarPermitidoInicioSesion(correoNormalizado);

        Usuario usuario = usuarioRepository.findByCorreoNormalizado(correoNormalizado)
                .orElseThrow(() -> {
                    controladorIntentos.registrarFalloInicioSesion(correoNormalizado);
                    return new CredencialesInvalidasException("Correo o contraseña incorrectos.");
                });

        if (!passwordEncoder.matches(solicitud.contrasena(), usuario.getContrasenaHash())) {
            controladorIntentos.registrarFalloInicioSesion(correoNormalizado);
            throw new CredencialesInvalidasException("Correo o contraseña incorrectos.");
        }

        controladorIntentos.limpiarIntentosInicioSesion(correoNormalizado);

        String tokenAcceso = proveedorJwt.generarTokenAcceso(usuario);
        String tokenRefrescoRaw = crearYPersistirTokenRefresco(usuario);
        agregarCookieRefresco(respuesta, tokenRefrescoRaw);

        long expiracionMs = propiedades.getJwt().getExpiracionAccesoMs();
        return new AutenticacionResponse(tokenAcceso, TIPO_TOKEN, expiracionMs, usuarioMapper.aRespuesta(usuario));
    }

    @Override
    @Transactional
    public AutenticacionResponse renovarSesion(HttpServletRequest solicitud, HttpServletResponse respuesta) {
        String tokenRefrescoRaw = leerCookieRefresco(solicitud)
                .orElseThrow(() -> new CredencialesInvalidasException("No hay sesión activa."));

        String hashToken = sha256Hex(tokenRefrescoRaw);

        TokenRefresco tokenRefresco = tokenRefrescoRepository.findByTokenHash(hashToken)
                .filter(t -> !t.isRevocado())
                .filter(t -> t.getFechaExpiracion().isAfter(Instant.now(reloj)))
                .orElseThrow(() -> new CredencialesInvalidasException("Sesión inválida o expirada."));

        tokenRefresco.setRevocado(true);
        tokenRefrescoRepository.save(tokenRefresco);

        Usuario usuario = tokenRefresco.getUsuario();
        String nuevoTokenAcceso = proveedorJwt.generarTokenAcceso(usuario);
        String nuevoTokenRefrescoRaw = crearYPersistirTokenRefresco(usuario);
        agregarCookieRefresco(respuesta, nuevoTokenRefrescoRaw);

        long expiracionMs = propiedades.getJwt().getExpiracionAccesoMs();
        return new AutenticacionResponse(nuevoTokenAcceso, TIPO_TOKEN, expiracionMs, usuarioMapper.aRespuesta(usuario));
    }

    @Override
    @Transactional
    public void cerrarSesion(HttpServletRequest solicitud, HttpServletResponse respuesta, UsuarioAutenticado usuarioActual) {
        leerCookieRefresco(solicitud).ifPresent(tokenRaw -> {
            String hashToken = sha256Hex(tokenRaw);
            tokenRefrescoRepository.findByTokenHash(hashToken).ifPresent(t -> {
                t.setRevocado(true);
                tokenRefrescoRepository.save(t);
            });
        });

        eliminarCookieRefresco(respuesta);
    }

    @Override
    @Transactional
    public MensajeResponse solicitarRecuperacion(RecuperarContrasenaRequest solicitud) {
        String correoNormalizado = normalizarCorreo(solicitud.correo());

        controladorIntentos.verificarYRegistrarRecuperacion(correoNormalizado);

        usuarioRepository.findByCorreoNormalizado(correoNormalizado).ifPresent(usuario -> {
            tokenRecuperacionRepository.invalidarPendientesPorUsuario(usuario.getId());

            String tokenRaw = UUID.randomUUID().toString();
            String hashToken = sha256Hex(tokenRaw);
            long expiracionMs = propiedades.getRecuperacion().getExpiracionMs();

            TokenRecuperacionContrasena tokenRecuperacion = new TokenRecuperacionContrasena();
            tokenRecuperacion.setUsuario(usuario);
            tokenRecuperacion.setTokenHash(hashToken);
            tokenRecuperacion.setFechaExpiracion(Instant.now(reloj).plusMillis(expiracionMs));
            tokenRecuperacion.setUtilizado(false);

            tokenRecuperacionRepository.save(tokenRecuperacion);

            log.info("[RECUPERACION] Token generado para usuario {}. Token (solo dev): {}", usuario.getId(), tokenRaw);
        });

        return new MensajeResponse(MENSAJE_RECUPERACION);
    }

    @Override
    @Transactional
    public MensajeResponse restablecerContrasena(RestablecerContrasenaRequest solicitud) {
        if (!solicitud.nuevaContrasena().equals(solicitud.confirmacionContrasena())) {
            throw new ReglaNegocioException("Las contraseñas no coinciden.");
        }

        String hashToken = sha256Hex(solicitud.token());

        TokenRecuperacionContrasena tokenRecuperacion = tokenRecuperacionRepository.findByTokenHash(hashToken)
                .filter(t -> !t.isUtilizado())
                .filter(t -> t.getFechaExpiracion().isAfter(Instant.now(reloj)))
                .orElseThrow(() -> new ReglaNegocioException("El enlace de recuperación no es válido o ha expirado."));

        Usuario usuario = tokenRecuperacion.getUsuario();
        usuario.setContrasenaHash(passwordEncoder.encode(solicitud.nuevaContrasena()));
        usuarioRepository.save(usuario);

        tokenRecuperacion.setUtilizado(true);
        tokenRecuperacionRepository.save(tokenRecuperacion);

        tokenRefrescoRepository.revocarActivosPorUsuario(usuario.getId());

        return new MensajeResponse("Contraseña restablecida correctamente. Ya puedes iniciar sesión.");
    }

    private String crearYPersistirTokenRefresco(Usuario usuario) {
        String tokenRaw = UUID.randomUUID().toString();
        String hashToken = sha256Hex(tokenRaw);

        long duracionMs = propiedades.getJwt().getExpiracionRefreshMs();

        TokenRefresco tokenRefresco = new TokenRefresco();
        tokenRefresco.setUsuario(usuario);
        tokenRefresco.setTokenHash(hashToken);
        tokenRefresco.setFechaExpiracion(Instant.now(reloj).plusMillis(duracionMs));
        tokenRefresco.setRevocado(false);

        tokenRefrescoRepository.save(tokenRefresco);
        return tokenRaw;
    }

    private void agregarCookieRefresco(HttpServletResponse respuesta, String tokenRaw) {
        PropiedadesAplicacion.Cookie configCookie = propiedades.getCookie();
        Cookie cookie = new Cookie(NOMBRE_COOKIE_REFRESCO, tokenRaw);
        cookie.setHttpOnly(true);
        cookie.setSecure(configCookie.isSegura());
        cookie.setPath("/api/auth");
        cookie.setMaxAge((int) (propiedades.getJwt().getExpiracionRefreshMs() / 1000));
        respuesta.addCookie(cookie);
    }

    private void eliminarCookieRefresco(HttpServletResponse respuesta) {
        Cookie cookie = new Cookie(NOMBRE_COOKIE_REFRESCO, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth");
        cookie.setMaxAge(0);
        respuesta.addCookie(cookie);
    }

    private Optional<String> leerCookieRefresco(HttpServletRequest solicitud) {
        if (solicitud.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(solicitud.getCookies())
                .filter(c -> NOMBRE_COOKIE_REFRESCO.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase();
    }

    private String sha256Hex(String valor) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(valor.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }

    private void crearCategoriasPorDefecto(Usuario usuario) {
        java.util.List<Categoria> categoriasIniciales = java.util.List.of(
                crearCategoria(usuario, "Trabajo", "#4F46E5"),
                crearCategoria(usuario, "Personal", "#16A34A"),
                crearCategoria(usuario, "Estudio", "#D97706")
        );
        categoriaRepository.saveAll(categoriasIniciales);
    }

    private Categoria crearCategoria(Usuario usuario, String nombre, String color) {
        Categoria categoria = new Categoria();
        categoria.setUsuario(usuario);
        categoria.setNombre(nombre);
        categoria.setColor(color);
        return categoria;
    }
}
