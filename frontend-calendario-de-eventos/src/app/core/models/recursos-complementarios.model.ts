export interface Categoria {
  id: string;
  nombre: string;
  color: string;
}

export interface CrearCategoriaRequest {
  nombre: string;
  color: string;
}

export interface Recordatorio {
  id: string;
  eventoId?: string;
  tareaId?: string;
  minutosAnticipacion: number;
  fechaActivacion: string;
  canal: string;
  procesado: boolean;
  tituloReferencia?: string;
}

export interface CrearRecordatorioRequest {
  eventoId?: string;
  tareaId?: string;
  minutosAnticipacion: number;
  canal?: string;
}

export interface Notificacion {
  id: string;
  recordatorioId?: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaLectura?: string;
  fechaCreacion: string;
}

export type FormatoHorario = 'H12' | 'H24';
export type PrimerDiaSemana = 'LUNES' | 'DOMINGO';
export type VistaCalendarioPreferida = 'MES' | 'SEMANA' | 'DIA' | 'AGENDA';

export interface ConfiguracionUsuario {
  zonaHoraria: string;
  formatoHorario: FormatoHorario;
  primerDiaSemana: PrimerDiaSemana;
  vistaPreferida: VistaCalendarioPreferida;
  colorPredeterminado: string;
  notificacionesActivas: boolean;
}

export interface ResumenPanel {
  eventosHoy: number;
  eventosMes: number;
  tareasPendientes: number;
  tareasCompletadas: number;
  tareasVencidas: number;
  porcentajeCumplimiento: number;
}
