package com.example.proyecto_calendario_de_eventos.security;

import com.example.proyecto_calendario_de_eventos.entity.Usuario;
import com.example.proyecto_calendario_de_eventos.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

@Service
public class DetallesUsuarioService implements UserDetailsService {

	private final UsuarioRepository usuarioRepository;

	public DetallesUsuarioService(UsuarioRepository usuarioRepository) {
		this.usuarioRepository = usuarioRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
		String correoNormalizado = correo.trim().toLowerCase(Locale.ROOT);
		Usuario usuario = usuarioRepository.findByCorreoNormalizado(correoNormalizado)
				.orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado."));
		return new UsuarioAutenticado(usuario);
	}

	public UsuarioAutenticado cargarPorId(UUID usuarioId) {
		Usuario usuario = usuarioRepository.findById(usuarioId)
				.orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado."));
		return new UsuarioAutenticado(usuario);
	}
}
