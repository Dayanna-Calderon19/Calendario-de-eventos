CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    correo_normalizado VARCHAR(255) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuarios_correo_normalizado UNIQUE (correo_normalizado)
);

CREATE TABLE tokens_refresco (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    revocado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tokens_refresco_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT uq_tokens_refresco_hash UNIQUE (token_hash)
);

CREATE TABLE tokens_recuperacion_contrasena (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    utilizado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tokens_recuperacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT uq_tokens_recuperacion_hash UNIQUE (token_hash)
);

CREATE INDEX idx_tokens_refresco_usuario ON tokens_refresco (usuario_id);
CREATE INDEX idx_tokens_recuperacion_usuario ON tokens_recuperacion_contrasena (usuario_id);
