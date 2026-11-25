package com.example.proyecto_calendario_de_eventos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
@Table(name = "configuraciones_usuario")
public class ConfiguracionUsuario {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "zona_horaria", nullable = false, length = 60)
    private String zonaHoraria = "America/Lima";

    @Column(name = "formato_horario", nullable = false, length = 10)
    private String formatoHorario = "H24";

    @Column(name = "primer_dia_semana", nullable = false, length = 15)
    private String primerDiaSemana = "LUNES";

    @Column(name = "vista_preferida", nullable = false, length = 20)
    private String vistaPreferida = "MES";

    @Column(name = "color_predeterminado", nullable = false, length = 7)
    private String colorPredeterminado = "#4f46e5";

    @Column(name = "notificaciones_activas", nullable = false)
    private boolean notificacionesActivas = true;

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
