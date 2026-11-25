export type TipoEvento = 'EVENTO' | 'CITA' | 'FECHA_IMPORTANTE';

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: TipoEvento;
  fechaInicio: string;
  fechaFin: string;
  diaCompleto: boolean;
  zonaHoraria: string;
  ubicacion?: string;
  color?: string;
  categoriaId?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CrearEventoRequest {
  titulo: string;
  descripcion?: string;
  tipo: TipoEvento;
  fechaInicio: string;
  fechaFin: string;
  diaCompleto: boolean;
  zonaHoraria?: string;
  ubicacion?: string;
  color?: string;
  categoriaId?: string;
}

export type ActualizarEventoRequest = CrearEventoRequest;

export interface ReprogramarEventoRequest {
  fechaInicio: string;
  fechaFin: string;
  diaCompleto?: boolean;
}
