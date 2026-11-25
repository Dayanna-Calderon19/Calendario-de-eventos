import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AutenticacionResponse,
  InicioSesionRequest,
  RecuperarContrasenaRequest,
  RegistroUsuarioRequest,
  RestablecerContrasenaRequest,
  Usuario
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${environment.apiUrl}/auth`;

  private readonly tokenAccesoSignal = signal<string | null>(null);
  private readonly usuarioSignal = signal<Usuario | null>(null);

  readonly usuarioActual = this.usuarioSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.tokenAccesoSignal() !== null);

  obtenerTokenAcceso(): string | null {
    return this.tokenAccesoSignal();
  }

  registrar(solicitud: RegistroUsuarioRequest): Observable<AutenticacionResponse> {
    return this.http
      .post<AutenticacionResponse>(`${this.urlBase}/registro`, solicitud, { withCredentials: true })
      .pipe(tap((respuesta) => this.establecerSesion(respuesta)));
  }

  iniciarSesion(solicitud: InicioSesionRequest): Observable<AutenticacionResponse> {
    return this.http
      .post<AutenticacionResponse>(`${this.urlBase}/iniciar-sesion`, solicitud, { withCredentials: true })
      .pipe(tap((respuesta) => this.establecerSesion(respuesta)));
  }

  renovarSesion(): Observable<AutenticacionResponse> {
    return this.http
      .post<AutenticacionResponse>(`${this.urlBase}/renovar`, {}, { withCredentials: true })
      .pipe(tap((respuesta) => this.establecerSesion(respuesta)));
  }

  cerrarSesion(): Observable<void> {
    return this.http
      .post<void>(`${this.urlBase}/cerrar-sesion`, {}, { withCredentials: true })
      .pipe(tap(() => this.limpiarSesion()));
  }

  solicitarRecuperacion(solicitud: RecuperarContrasenaRequest): Observable<void> {
    return this.http.post<void>(`${this.urlBase}/recuperar-contrasena`, solicitud);
  }

  restablecerContrasena(solicitud: RestablecerContrasenaRequest): Observable<void> {
    return this.http.post<void>(`${this.urlBase}/restablecer-contrasena`, solicitud);
  }

  limpiarSesion(): void {
    this.tokenAccesoSignal.set(null);
    this.usuarioSignal.set(null);
  }

  private establecerSesion(respuesta: AutenticacionResponse): void {
    this.tokenAccesoSignal.set(respuesta.tokenAcceso);
    this.usuarioSignal.set(respuesta.usuario);
  }
}
