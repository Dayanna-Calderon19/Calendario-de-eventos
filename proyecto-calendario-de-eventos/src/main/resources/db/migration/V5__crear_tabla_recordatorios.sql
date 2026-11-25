CREATE TABLE recordatorios (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    evento_id UUID,
    tarea_id UUID,
    minutos_anticipacion INTEGER NOT NULL,
    fecha_activacion TIMESTAMPTZ NOT NULL,
    canal VARCHAR(30) NOT NULL DEFAULT 'APLICACION',
    procesado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_procesamiento TIMESTAMPTZ,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recordatorios_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_recordatorios_evento FOREIGN KEY (evento_id) REFERENCES eventos (id) ON DELETE CASCADE,
    CONSTRAINT fk_recordatorios_tarea FOREIGN KEY (tarea_id) REFERENCES tareas (id) ON DELETE CASCADE,
    CONSTRAINT chk_recordatorios_referencia CHECK ((evento_id IS NOT NULL) <> (tarea_id IS NOT NULL)),
    CONSTRAINT chk_recordatorios_anticipacion CHECK (minutos_anticipacion >= 0)
);

CREATE INDEX idx_recordatorios_usuario ON recordatorios (usuario_id);
CREATE INDEX idx_recordatorios_pendientes ON recordatorios (procesado, fecha_activacion);
