export type PrioridadTarea = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type EstadoTarea = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  porcentajeProgreso: number;
  fechaLimite?: string;
  fechaCompletada?: string;
  eventoId?: string;
  categoriaId?: string;
  vencida: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CrearTareaRequest {
  titulo: string;
  descripcion?: string;
  prioridad: PrioridadTarea;
  estado?: EstadoTarea;
  porcentajeProgreso?: number;
  fechaLimite?: string;
  eventoId?: string;
  categoriaId?: string;
}

export interface ActualizarTareaRequest {
  titulo: string;
  descripcion?: string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  porcentajeProgreso?: number;
  fechaLimite?: string;
  eventoId?: string;
  categoriaId?: string;
}

export interface CambiarEstadoTareaRequest {
  estado: EstadoTarea;
  porcentajeProgreso?: number;
}
