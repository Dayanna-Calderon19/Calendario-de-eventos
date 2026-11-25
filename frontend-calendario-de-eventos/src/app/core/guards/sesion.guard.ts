import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

export const sesionGuard: CanActivateFn = () => {
  const autenticacionService = inject(AutenticacionService);
  const router = inject(Router);

  if (autenticacionService.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/iniciar-sesion']);
};

export const invitadoGuard: CanActivateFn = () => {
  const autenticacionService = inject(AutenticacionService);
  const router = inject(Router);

  if (!autenticacionService.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/calendario']);
};
