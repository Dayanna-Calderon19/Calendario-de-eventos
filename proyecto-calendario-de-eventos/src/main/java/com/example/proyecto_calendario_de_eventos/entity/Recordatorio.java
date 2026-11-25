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
@Table(name = "recordatorios")
public class Recordatorio {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(name = "evento_id")
	private UUID eventoId;

	@Column(name = "tarea_id")
	private UUID tareaId;

	@Column(name = "minutos_anticipacion", nullable = false)
	private Integer minutosAnticipacion;

	@Column(name = "fecha_activacion", nullable = false)
	private Instant fechaActivacion;

	@Column(nullable = false, length = 30)
	private String canal = "APLICACION";

	@Column(nullable = false)
	private boolean procesado = false;

	@Column(name = "fecha_procesamiento")
	private Instant fechaProcesamiento;

	@Column(name = "fecha_creacion", nullable = false, updatable = false)
	private Instant fechaCreacion;

	@PrePersist
	public void alCrear() {
		if (this.id == null) {
			this.id = UUID.randomUUID();
		}
		if (this.canal == null || this.canal.isBlank()) {
			this.canal = "APLICACION";
		}
		if (this.fechaCreacion == null) {
			this.fechaCreacion = Instant.now();
		}
	}
}
