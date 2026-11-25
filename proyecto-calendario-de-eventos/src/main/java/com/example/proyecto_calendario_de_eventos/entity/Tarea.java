package com.example.proyecto_calendario_de_eventos.entity;

import com.example.proyecto_calendario_de_eventos.enums.EstadoTarea;
import com.example.proyecto_calendario_de_eventos.enums.PrioridadTarea;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "tareas")
public class Tarea {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(name = "evento_id")
	private UUID eventoId;

	@Column(name = "categoria_id")
	private UUID categoriaId;

	@Column(nullable = false, length = 150)
	private String titulo;

	@Column(length = 1000)
	private String descripcion;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PrioridadTarea prioridad;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private EstadoTarea estado;

	@Column(name = "porcentaje_progreso", nullable = false)
	private int porcentajeProgreso = 0;

	@Column(name = "fecha_limite")
	private Instant fechaLimite;

	@Column(name = "fecha_completada")
	private Instant fechaCompletada;

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
