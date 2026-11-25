package com.example.proyecto_calendario_de_eventos.security;

import com.example.proyecto_calendario_de_eventos.config.PropiedadesAplicacion;
import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Component
public class ProveedorJwt {

	private final PropiedadesAplicacion propiedades;
	private final Clock reloj;
	private final SecretKey claveFirma;

	public ProveedorJwt(PropiedadesAplicacion propiedades, Clock reloj) {
		this.propiedades = propiedades;
		this.reloj = reloj;
		byte[] bytesClave = propiedades.getJwt().getSecreto().getBytes(StandardCharsets.UTF_8);
		this.claveFirma = Keys.hmacShaKeyFor(bytesClave);
	}

	public String generarTokenAcceso(Usuario usuario) {
		Instant ahora = reloj.instant();
		Instant expiracion = ahora.plusMillis(propiedades.getJwt().getExpiracionAccesoMs());

		return Jwts.builder()
				.subject(usuario.getId().toString())
				.claim("correo", usuario.getCorreoNormalizado())
				.issuedAt(Date.from(ahora))
				.expiration(Date.from(expiracion))
				.signWith(claveFirma)
				.compact();
	}

	public Optional<UUID> extraerUsuarioIdSiEsValido(String token) {
		try {
			Claims reclamos = Jwts.parser()
					.verifyWith(claveFirma)
					.build()
					.parseSignedClaims(token)
					.getPayload();

			String sujeto = reclamos.getSubject();
			if (sujeto == null || sujeto.isBlank()) {
				return Optional.empty();
			}
			return Optional.of(UUID.fromString(sujeto));
		} catch (JwtException | IllegalArgumentException excepcion) {
			return Optional.empty();
		}
	}
}
