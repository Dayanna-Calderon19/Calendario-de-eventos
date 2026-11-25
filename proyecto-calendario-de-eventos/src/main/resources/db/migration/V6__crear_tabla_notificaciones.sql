CREATE TABLE notificaciones (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    recordatorio_id UUID,
    titulo VARCHAR(150) NOT NULL,
    mensaje VARCHAR(500) NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_lectura TIMESTAMPTZ,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_notificaciones_recordatorio FOREIGN KEY (recordatorio_id) REFERENCES recordatorios (id) ON DELETE SET NULL
);

CREATE INDEX idx_notificaciones_usuario_estado ON notificaciones (usuario_id, leida, fecha_creacion DESC);
