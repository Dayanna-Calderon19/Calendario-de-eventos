package com.example.proyecto_calendario_de_eventos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "usuarios")
public class Usuario {

	@Id
	private UUID id;

	@Column(nullable = false, length = 100)
	private String nombres;

	@Column(nullable = false, length = 100)
	private String apellidos;

	@Column(nullable = false, length = 255)
	private String correo;

	@Column(name = "correo_normalizado", nullable = false, unique = true, length = 255)
	private String correoNormalizado;

	@Column(name = "contrasena_hash", nullable = false, length = 255)
	private String contrasenaHash;

	@Column(nullable = false)
	private boolean activo = true;

	@Column(name = "fecha_creacion", nullable = false, updatable = false)
	private Instant fechaCreacion;

	@Column(name = "fecha_actualizacion", nullable = false)
	private Instant fechaActualizacion;

	@PrePersist
	public void alCrear() {
		Instant ahora = Instant.now();
		if (this.id == null) {
			this.id = UUID.randomUUID();
		}
		this.fechaCreacion = ahora;
		this.fechaActualizacion = ahora;
	}

	@PreUpdate
	public void alActualizar() {
		this.fechaActualizacion = Instant.now();
	}
}
