CREATE TABLE configuraciones_usuario (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    zona_horaria VARCHAR(60) NOT NULL DEFAULT 'America/Lima',
    formato_horario VARCHAR(10) NOT NULL DEFAULT 'H24',
    primer_dia_semana VARCHAR(15) NOT NULL DEFAULT 'LUNES',
    vista_preferida VARCHAR(20) NOT NULL DEFAULT 'MES',
    color_predeterminado VARCHAR(7) NOT NULL DEFAULT '#4f46e5',
    notificaciones_activas BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_configuraciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT uq_configuraciones_usuario UNIQUE (usuario_id)
);
