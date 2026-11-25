import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AutenticacionService } from '../services/autenticacion.service';

export const autenticacionInterceptor: HttpInterceptorFn = (solicitud, siguiente) => {
  const autenticacionService = inject(AutenticacionService);
  const router = inject(Router);

  const esSolicitudApi = solicitud.url.startsWith(environment.apiUrl);
  const token = autenticacionService.obtenerTokenAcceso();

  const solicitudClonada = esSolicitudApi
    ? solicitud.clone({
        withCredentials: true,
        setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
      })
    : solicitud;

  return siguiente(solicitudClonada).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && esSolicitudApi && !solicitud.url.includes('/auth/')) {
        autenticacionService.limpiarSesion();
        void router.navigate(['/iniciar-sesion']);
      }
      return throwError(() => error);
    })
  );
};
