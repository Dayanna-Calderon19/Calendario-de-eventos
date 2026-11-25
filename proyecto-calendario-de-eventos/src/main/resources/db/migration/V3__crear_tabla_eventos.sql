CREATE TABLE eventos (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    categoria_id UUID,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(1000),
    tipo VARCHAR(40) NOT NULL,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    dia_completo BOOLEAN NOT NULL DEFAULT FALSE,
    zona_horaria VARCHAR(60) NOT NULL,
    ubicacion VARCHAR(200),
    color VARCHAR(7),
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_eliminacion TIMESTAMPTZ,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eventos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_eventos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE SET NULL,
    CONSTRAINT chk_eventos_fechas CHECK (fecha_fin > fecha_inicio)
);

CREATE INDEX idx_eventos_usuario ON eventos (usuario_id);
CREATE INDEX idx_eventos_usuario_rango ON eventos (usuario_id, fecha_inicio, fecha_fin);
CREATE INDEX idx_eventos_categoria ON eventos (categoria_id);
