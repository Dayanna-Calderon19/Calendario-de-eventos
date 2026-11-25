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
@Table(name = "tokens_recuperacion_contrasena")
public class TokenRecuperacionContrasena {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(name = "token_hash", nullable = false, unique = true, length = 255)
	private String tokenHash;

	@Column(name = "fecha_expiracion", nullable = false)
	private Instant fechaExpiracion;

	@Column(nullable = false)
	private boolean utilizado = false;

	@Column(name = "fecha_creacion", nullable = false, updatable = false)
	private Instant fechaCreacion;

	@PrePersist
	public void alCrear() {
		if (this.id == null) {
			this.id = UUID.randomUUID();
		}
		this.fechaCreacion = Instant.now();
	}
}
