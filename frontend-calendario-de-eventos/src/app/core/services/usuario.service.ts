import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActualizarPerfilRequest, ConfiguracionUsuario, Usuario } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${environment.apiUrl}/usuarios`;

  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.urlBase}/perfil`);
  }

  actualizarPerfil(solicitud: ActualizarPerfilRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.urlBase}/perfil`, solicitud);
  }

  obtenerConfiguracion(): Observable<ConfiguracionUsuario> {
    return this.http.get<ConfiguracionUsuario>(`${this.urlBase}/configuracion`);
  }

  actualizarConfiguracion(configuracion: ConfiguracionUsuario): Observable<ConfiguracionUsuario> {
    return this.http.put<ConfiguracionUsuario>(`${this.urlBase}/configuracion`, configuracion);
  }

  eliminarCuenta(): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/cuenta`);
  }
}
