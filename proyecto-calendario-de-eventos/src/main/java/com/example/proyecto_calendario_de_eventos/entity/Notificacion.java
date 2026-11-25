package com.example.proyecto_calendario_de_eventos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
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
@Table(name = "notificaciones")
public class Notificacion {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(name = "recordatorio_id")
	private UUID recordatorioId;

	@Column(nullable = false, length = 150)
	private String titulo;

	@Column(nullable = false, length = 500)
	private String mensaje;

	@Column(nullable = false)
	private boolean leida = false;

	@Column(name = "fecha_lectura")
	private Instant fechaLectura;

	@Column(name = "fecha_creacion", nullable = false, updatable = false)
	private Instant fechaCreacion;

	@PrePersist
	public void alCrear() {
		if (this.id == null) {
			this.id = UUID.randomUUID();
		}
		if (this.fechaCreacion == null) {
			this.fechaCreacion = Instant.now();
		}
	}
}
