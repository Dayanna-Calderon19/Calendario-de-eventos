import { Routes } from '@angular/router';
import { invitadoGuard, sesionGuard } from './core/guards/sesion.guard';
import { LayoutPrivadoComponent } from './layouts/layout-privado.component';
import { LayoutPublicoComponent } from './layouts/layout-publico.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutPublicoComponent,
    canActivate: [invitadoGuard],
    children: [
      {
        path: 'iniciar-sesion',
        loadComponent: () =>
          import('./features/autenticacion/iniciar-sesion-page.component').then(
            (m) => m.IniciarSesionPageComponent
          )
      },
      {
        path: 'registro',
        loadComponent: () =>
          import('./features/autenticacion/registro-page.component').then(
            (m) => m.RegistroPageComponent
          )
      },
      {
        path: 'recuperar-contrasena',
        loadComponent: () =>
          import('./features/autenticacion/recuperar-contrasena-page.component').then(
            (m) => m.RecuperarContrasenaPageComponent
          )
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'iniciar-sesion'
      }
    ]
  },
  {
    path: '',
    component: LayoutPrivadoComponent,
    canActivate: [sesionGuard],
    children: [
      {
        path: 'calendario',
        loadComponent: () =>
          import('./features/calendario/calendario-page.component').then(
            (m) => m.CalendarioPageComponent
          )
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./features/eventos/eventos-page.component').then(
            (m) => m.EventosPageComponent
          )
      },
      {
        path: 'tareas',
        loadComponent: () =>
          import('./features/tareas/tareas-page.component').then(
            (m) => m.TareasPageComponent
          )
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./features/notificaciones/notificaciones-page.component').then(
            (m) => m.NotificacionesPageComponent
          )
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./features/configuracion/configuracion-page.component').then(
            (m) => m.ConfiguracionPageComponent
          )
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'calendario'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'calendario'
  }
];
