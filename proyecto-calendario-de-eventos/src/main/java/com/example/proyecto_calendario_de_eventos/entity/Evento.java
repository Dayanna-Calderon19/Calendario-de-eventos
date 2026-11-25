package com.example.proyecto_calendario_de_eventos.entity;

import com.example.proyecto_calendario_de_eventos.enums.TipoEvento;
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
@Table(name = "eventos")
public class Evento {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(name = "categoria_id")
	private UUID categoriaId;

	@Column(nullable = false, length = 150)
	private String titulo;

	@Column(length = 1000)
	private String descripcion;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private TipoEvento tipo;

	@Column(name = "fecha_inicio", nullable = false)
	private Instant fechaInicio;

	@Column(name = "fecha_fin", nullable = false)
	private Instant fechaFin;

	@Column(name = "dia_completo", nullable = false)
	private boolean diaCompleto = false;

	@Column(name = "zona_horaria", nullable = false, length = 60)
	private String zonaHoraria = "America/Lima";

	@Column(length = 200)
	private String ubicacion;

	@Column(length = 7)
	private String color;

	@Column(nullable = false)
	private boolean eliminado = false;

	@Column(name = "fecha_eliminacion")
	private Instant fechaEliminacion;

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
