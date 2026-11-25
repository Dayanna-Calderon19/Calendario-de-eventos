import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ActualizarEventoRequest,
  CrearEventoRequest,
  Evento,
  ReprogramarEventoRequest,
  TipoEvento
} from '../models';

export interface FiltrosEvento {
  busqueda?: string;
  tipo?: TipoEvento;
  categoriaId?: string;
  desde?: string;
  hasta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${environment.apiUrl}/eventos`;

  listarEventos(filtros?: string | FiltrosEvento): Observable<Evento[]> {
    let parametros = new HttpParams();
    if (typeof filtros === 'string') {
      if (filtros.trim()) {
        parametros = parametros.set('busqueda', filtros.trim());
      }
    } else if (filtros) {
      if (filtros.busqueda?.trim()) {
        parametros = parametros.set('busqueda', filtros.busqueda.trim());
      }
      if (filtros.tipo) {
        parametros = parametros.set('tipo', filtros.tipo);
      }
      if (filtros.categoriaId) {
        parametros = parametros.set('categoriaId', filtros.categoriaId);
      }
      if (filtros.desde) {
        parametros = parametros.set('desde', filtros.desde);
      }
      if (filtros.hasta) {
        parametros = parametros.set('hasta', filtros.hasta);
      }
    }
    return this.http.get<Evento[]>(this.urlBase, { params: parametros });
  }

  obtenerEventosCalendario(fechaInicio: string, fechaFin: string): Observable<Evento[]> {
    const parametros = new HttpParams()
      .set('inicio', fechaInicio)
      .set('fin', fechaFin);
    return this.http.get<Evento[]>(`${this.urlBase}/calendario`, { params: parametros });
  }

  obtenerEvento(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.urlBase}/${id}`);
  }

  crearEvento(solicitud: CrearEventoRequest): Observable<Evento> {
    return this.http.post<Evento>(this.urlBase, solicitud);
  }

  actualizarEvento(id: string, solicitud: ActualizarEventoRequest): Observable<Evento> {
    return this.http.put<Evento>(`${this.urlBase}/${id}`, solicitud);
  }

  reprogramarEvento(id: string, solicitud: ReprogramarEventoRequest): Observable<Evento> {
    return this.http.patch<Evento>(`${this.urlBase}/${id}/reprogramar`, solicitud);
  }

  eliminarEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
