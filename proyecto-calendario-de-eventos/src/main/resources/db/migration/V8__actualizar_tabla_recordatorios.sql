ALTER TABLE recordatorios
    ADD COLUMN IF NOT EXISTS titulo VARCHAR(150) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS descripcion VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS fecha_recordatorio TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(40) NOT NULL DEFAULT 'ALERTA',
    ADD COLUMN IF NOT EXISTS notificado BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE recordatorios
    DROP CONSTRAINT IF EXISTS chk_recordatorios_referencia;

ALTER TABLE recordatorios
    ALTER COLUMN minutos_anticipacion DROP NOT NULL,
    ALTER COLUMN fecha_activacion DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recordatorios_usuario_notificado
    ON recordatorios (usuario_id, notificado);
