package com.example.proyecto_calendario_de_eventos.repository;

import com.example.proyecto_calendario_de_eventos.entity.ConfiguracionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConfiguracionUsuarioRepository extends JpaRepository<ConfiguracionUsuario, UUID> {

    Optional<ConfiguracionUsuario> findByUsuarioId(UUID usuarioId);
}
