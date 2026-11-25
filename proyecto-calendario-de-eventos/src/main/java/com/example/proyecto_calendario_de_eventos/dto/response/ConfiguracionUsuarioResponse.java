package com.example.proyecto_calendario_de_eventos.dto.response;

public record ConfiguracionUsuarioResponse(
        String zonaHoraria,
        String formatoHorario,
        String primerDiaSemana,
        String vistaPreferida,
        String colorPredeterminado,
        boolean notificacionesActivas
) {
}
