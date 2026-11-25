package com.example.proyecto_calendario_de_eventos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ActualizarConfiguracionRequest(
        @NotBlank(message = "La zona horaria es obligatoria.")
        @Size(max = 60, message = "La zona horaria no debe exceder 60 caracteres.")
        String zonaHoraria,

        @NotBlank(message = "El formato horario es obligatorio.")
        @Pattern(regexp = "^(H12|H24)$", message = "El formato horario debe ser H12 o H24.")
        String formatoHorario,

        @NotBlank(message = "El primer día de la semana es obligatorio.")
        @Pattern(regexp = "^(LUNES|DOMINGO)$", message = "El primer día de la semana debe ser LUNES o DOMINGO.")
        String primerDiaSemana,

        @NotBlank(message = "La vista preferida es obligatoria.")
        @Pattern(regexp = "^(MES|SEMANA|DIA|AGENDA)$", message = "La vista preferida debe ser MES, SEMANA, DIA o AGENDA.")
        String vistaPreferida,

        @NotBlank(message = "El color predeterminado es obligatorio.")
        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "El color predeterminado debe tener formato hexadecimal (#RRGGBB).")
        String colorPredeterminado,

        @NotNull(message = "Debe indicar si las notificaciones están activas.")
        Boolean notificacionesActivas
) {
}
