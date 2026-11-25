CREATE TABLE categorias (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    color VARCHAR(7) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categorias_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT uq_categorias_usuario_nombre UNIQUE (usuario_id, nombre)
);

CREATE INDEX idx_categorias_usuario ON categorias (usuario_id);
