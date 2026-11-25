package com.example.proyecto_calendario_de_eventos.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
public class FiltroAutenticacionJwt extends OncePerRequestFilter {

	private static final String PREFIJO_BEARER = "Bearer ";

	private final ProveedorJwt proveedorJwt;
	private final DetallesUsuarioService detallesUsuarioService;

	public FiltroAutenticacionJwt(ProveedorJwt proveedorJwt, DetallesUsuarioService detallesUsuarioService) {
		this.proveedorJwt = proveedorJwt;
		this.detallesUsuarioService = detallesUsuarioService;
	}

	@Override
	protected void doFilterInternal(
			HttpServletRequest solicitud,
			HttpServletResponse respuesta,
			FilterChain cadenaFiltros
	) throws ServletException, IOException {
		String encabezadoAutorizacion = solicitud.getHeader(HttpHeaders.AUTHORIZATION);

		if (encabezadoAutorizacion == null || !encabezadoAutorizacion.startsWith(PREFIJO_BEARER)) {
			cadenaFiltros.doFilter(solicitud, respuesta);
			return;
		}

		String token = encabezadoAutorizacion.substring(PREFIJO_BEARER.length()).trim();
		if (token.isEmpty() || SecurityContextHolder.getContext().getAuthentication() != null) {
			cadenaFiltros.doFilter(solicitud, respuesta);
			return;
		}

		Optional<UUID> usuarioId = proveedorJwt.extraerUsuarioIdSiEsValido(token);
		if (usuarioId.isPresent()) {
			try {
				UsuarioAutenticado usuarioAutenticado = detallesUsuarioService.cargarPorId(usuarioId.get());
				if (usuarioAutenticado.isEnabled()) {
					UsernamePasswordAuthenticationToken autenticacion = new UsernamePasswordAuthenticationToken(
							usuarioAutenticado,
							null,
							usuarioAutenticado.getAuthorities()
					);
					autenticacion.setDetails(new WebAuthenticationDetailsSource().buildDetails(solicitud));
					SecurityContextHolder.getContext().setAuthentication(autenticacion);
				}
			} catch (UsernameNotFoundException ignored) {
				SecurityContextHolder.clearContext();
			}
		}

		cadenaFiltros.doFilter(solicitud, respuesta);
	}
}
