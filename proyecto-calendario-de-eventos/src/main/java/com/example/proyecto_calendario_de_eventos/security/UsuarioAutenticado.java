package com.example.proyecto_calendario_de_eventos.security;

import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
public class UsuarioAutenticado implements UserDetails {

	private final UUID id;
	private final String correoNormalizado;
	private final String contrasenaHash;
	private final boolean activo;
	private final Collection<? extends GrantedAuthority> autoridades;

	public UsuarioAutenticado(Usuario usuario) {
		this.id = usuario.getId();
		this.correoNormalizado = usuario.getCorreoNormalizado();
		this.contrasenaHash = usuario.getContrasenaHash();
		this.activo = usuario.isActivo();
		this.autoridades = List.of(new SimpleGrantedAuthority("ROLE_USUARIO"));
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return autoridades;
	}

	@Override
	public String getPassword() {
		return contrasenaHash;
	}

	@Override
	public String getUsername() {
		return correoNormalizado;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return activo;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return activo;
	}
}
