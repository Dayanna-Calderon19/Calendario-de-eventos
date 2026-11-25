import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorApi {
  codigo?: number;
  mensaje: string;
  detalles: Record<string, string>;
}

export function extraerErrorApi(error: unknown, mensajePorDefecto: string): ErrorApi {
  if (!(error instanceof HttpErrorResponse)) {
    return { mensaje: mensajePorDefecto, detalles: {} };
  }

  if (error.status === 0) {
    return {
      codigo: 0,
      mensaje: 'No se pudo conectar con el servidor. Verifica que el servicio esté activo.',
      detalles: {},
    };
  }

  const cuerpo = error.error;
  if (cuerpo && typeof cuerpo === 'object') {
    const mensaje =
      typeof cuerpo.mensaje === 'string' && cuerpo.mensaje.trim().length > 0
        ? cuerpo.mensaje
        : mensajePorDefecto;

    const detalles: Record<string, string> = {};
    if (cuerpo.detalles && typeof cuerpo.detalles === 'object') {
      for (const [campo, valor] of Object.entries(cuerpo.detalles)) {
        if (typeof valor === 'string' && valor.trim().length > 0) {
          detalles[campo] = valor;
        }
      }
    }

    return {
      codigo: error.status,
      mensaje,
      detalles,
    };
  }

  return {
    codigo: error.status,
    mensaje: mensajePorDefecto,
    detalles: {},
  };
}
