package com.example.proyecto_calendario_de_eventos.repository;

import com.example.proyecto_calendario_de_eventos.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {

	List<Categoria> findByUsuarioIdOrderByNombreAsc(UUID usuarioId);

	Optional<Categoria> findByIdAndUsuarioId(UUID id, UUID usuarioId);

	boolean existsByUsuarioIdAndNombreIgnoreCase(UUID usuarioId, String nombre);
}
