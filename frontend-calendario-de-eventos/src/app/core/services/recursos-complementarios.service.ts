import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Categoria,
  CrearCategoriaRequest,
  CrearRecordatorioRequest,
  Notificacion,
  Recordatorio,
  ResumenPanel
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${environment.apiUrl}/categorias`;

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.urlBase);
  }

  crearCategoria(solicitud: CrearCategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(this.urlBase, solicitud);
  }

  actualizarCategoria(id: string, solicitud: CrearCategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.urlBase}/${id}`, solicitud);
  }

  eliminarCategoria(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecordatorioService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${environment.apiUrl}/recordatorios`;

  listarRecordatorios(eventoId?: string, tareaId?: string): Observable<Recordatorio[]> {
    let params: Record<string, string> = {};
    if (eventoId) params['eventoId'] = eventoId;
    if (tareaId) params['tareaId'] = tareaId;
    return this.http.get<Recordatorio[]>(this.urlBase, { params });
  }

  crearRecordatorio(solicitud: CrearRecordatorioRequest): Observable<Recordatorio> {
    return this.http.post<Recordatorio>(this.urlBase, solicitud);
  }

  eliminarRecordatorio(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${environment.apiUrl}/notificaciones`;

  listarNotificaciones(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.urlBase);
  }

  contarNoLeidas(): Observable<number> {
    return this.http.get<number>(`${this.urlBase}/no-leidas/cantidad`);
  }

  marcarComoLeida(id: string): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.urlBase}/${id}/leida`, {});
  }

  marcarTodasComoLeidas(): Observable<void> {
    return this.http.patch<void>(`${this.urlBase}/marcar-todas-leidas`, {});
  }

  eliminarNotificacion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class PanelService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${environment.apiUrl}/panel`;

  obtenerResumen(): Observable<ResumenPanel> {
    return this.http.get<ResumenPanel>(`${this.urlBase}/resumen`);
  }
}
