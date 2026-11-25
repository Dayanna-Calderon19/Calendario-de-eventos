CREATE TABLE tareas (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    evento_id UUID,
    categoria_id UUID,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(1000),
    prioridad VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    porcentaje_progreso INTEGER NOT NULL DEFAULT 0,
    fecha_limite TIMESTAMPTZ,
    fecha_completada TIMESTAMPTZ,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tareas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_tareas_evento FOREIGN KEY (evento_id) REFERENCES eventos (id) ON DELETE SET NULL,
    CONSTRAINT fk_tareas_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE SET NULL,
    CONSTRAINT chk_tareas_progreso CHECK (porcentaje_progreso >= 0 AND porcentaje_progreso <= 100)
);

CREATE INDEX idx_tareas_usuario ON tareas (usuario_id);
CREATE INDEX idx_tareas_usuario_estado ON tareas (usuario_id, estado);
CREATE INDEX idx_tareas_fecha_limite ON tareas (fecha_limite);
