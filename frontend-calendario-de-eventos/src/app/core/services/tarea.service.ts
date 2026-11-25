import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ActualizarTareaRequest,
  CambiarEstadoTareaRequest,
  CrearTareaRequest,
  EstadoTarea,
  PrioridadTarea,
  Tarea,
} from '../models';

export interface FiltrosTarea {
  busqueda?: string;
  estado?: EstadoTarea;
  prioridad?: PrioridadTarea;
  categoriaId?: string;
  desde?: string;
  hasta?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TareaService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${environment.apiUrl}/tareas`;

  listarTareas(filtros?: FiltrosTarea): Observable<Tarea[]> {
    let parametros = new HttpParams();
    if (filtros?.busqueda?.trim()) {
      parametros = parametros.set('busqueda', filtros.busqueda.trim());
    }
    if (filtros?.estado) {
      parametros = parametros.set('estado', filtros.estado);
    }
    if (filtros?.prioridad) {
      parametros = parametros.set('prioridad', filtros.prioridad);
    }
    if (filtros?.categoriaId) {
      parametros = parametros.set('categoriaId', filtros.categoriaId);
    }
    if (filtros?.desde) {
      parametros = parametros.set('desde', filtros.desde);
    }
    if (filtros?.hasta) {
      parametros = parametros.set('hasta', filtros.hasta);
    }
    return this.http.get<Tarea[]>(this.urlBase, { params: parametros });
  }

  obtenerTarea(id: string): Observable<Tarea> {
    return this.http.get<Tarea>(`${this.urlBase}/${id}`);
  }

  crearTarea(solicitud: CrearTareaRequest): Observable<Tarea> {
    return this.http.post<Tarea>(this.urlBase, solicitud);
  }

  actualizarTarea(id: string, solicitud: ActualizarTareaRequest): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.urlBase}/${id}`, solicitud);
  }

  cambiarEstado(id: string, solicitud: CambiarEstadoTareaRequest): Observable<Tarea> {
    return this.http.patch<Tarea>(`${this.urlBase}/${id}/estado`, solicitud);
  }

  eliminarTarea(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
