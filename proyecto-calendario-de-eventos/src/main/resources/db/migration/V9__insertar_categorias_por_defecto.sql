INSERT INTO categorias (id, usuario_id, nombre, color, fecha_creacion, fecha_actualizacion)
SELECT gen_random_uuid(), u.id, v.nombre, v.color, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM usuarios u
CROSS JOIN (
    VALUES
        ('Trabajo', '#4F46E5'),
        ('Personal', '#16A34A'),
        ('Estudio', '#D97706')
) AS v(nombre, color)
WHERE NOT EXISTS (
    SELECT 1
    FROM categorias c
    WHERE c.usuario_id = u.id
);
