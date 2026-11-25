package com.example.proyecto_calendario_de_eventos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "categorias")
public class Categoria {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(nullable = false, length = 80)
	private String nombre;

	@Column(nullable = false, length = 7)
	private String color;

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
