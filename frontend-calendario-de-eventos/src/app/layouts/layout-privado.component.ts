import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  Bell,
  Calendar,
  CalendarDays,
  CheckSquare,
  LogOut,
  LucideAngularModule,
  Settings
} from 'lucide-angular';
import { AutenticacionService, NotificacionService } from '../core/services';

@Component({
  selector: 'app-layout-privado',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="estructura-app">
      <aside class="barra-lateral" aria-label="Navegación principal">
        <div class="marca-app">
          <lucide-icon [img]="iconoCalendario" [size]="22" />
          <span>Mi Calendario</span>
        </div>

        <nav class="menu-navegacion">
          <a routerLink="/calendario" routerLinkActive="enlace-activo" class="enlace-menu">
            <lucide-icon [img]="iconoCalendario" [size]="18" />
            <span>Calendario</span>
          </a>
          <a routerLink="/eventos" routerLinkActive="enlace-activo" class="enlace-menu">
            <lucide-icon [img]="iconoEventos" [size]="18" />
            <span>Eventos</span>
          </a>
          <a routerLink="/tareas" routerLinkActive="enlace-activo" class="enlace-menu">
            <lucide-icon [img]="iconoTareas" [size]="18" />
            <span>Tareas</span>
          </a>
          <a routerLink="/notificaciones" routerLinkActive="enlace-activo" class="enlace-menu enlace-notificaciones">
            <lucide-icon [img]="iconoNotificaciones" [size]="18" />
            <span>Notificaciones</span>
            @if (badgeNoLeidas() > 0) {
              <span class="badge-notificaciones" aria-label="{{ badgeNoLeidas() }} notificaciones sin leer">
                {{ badgeNoLeidas() > 99 ? '99+' : badgeNoLeidas() }}
              </span>
            }
          </a>
          <a routerLink="/configuracion" routerLinkActive="enlace-activo" class="enlace-menu">
            <lucide-icon [img]="iconoConfiguracion" [size]="18" />
            <span>Configuración</span>
          </a>
        </nav>

        <button type="button" class="boton-salir" (click)="cerrarSesion()">
          <lucide-icon [img]="iconoSalir" [size]="18" />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <main class="contenido-principal">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .estructura-app {
      min-height: 100dvh;
      display: grid;
      grid-template-columns: 240px 1fr;
    }
    .barra-lateral {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.25rem 1rem;
      background-color: var(--color-superficie);
      border-right: 1px solid var(--color-borde);
    }
    .marca-app {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-weight: 700;
      font-size: 1.0625rem;
      color: var(--color-primario);
      padding-inline: 0.5rem;
    }
    .menu-navegacion {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      flex: 1;
    }
    .enlace-menu,
    .boton-salir {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: var(--radio-pequeno);
      color: var(--color-texto-secundario);
      font-weight: 500;
      background: transparent;
      border: 0;
      cursor: pointer;
      text-align: left;
      transition: background-color var(--transicion-base), color var(--transicion-base);
    }
    .enlace-menu:hover,
    .boton-salir:hover {
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto);
    }
    .enlace-activo {
      background-color: var(--color-primario-suave);
      color: var(--color-primario);
      font-weight: 600;
    }
    .enlace-notificaciones {
      position: relative;
    }
    .badge-notificaciones {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 0.3125rem;
      border-radius: 999px;
      background-color: var(--color-primario);
      color: #fff;
      font-size: 0.6875rem;
      font-weight: 700;
      line-height: 1;
    }
    .contenido-principal {
      padding: 1.5rem;
      min-width: 0;
    }
    @media (max-width: 768px) {
      .estructura-app {
        grid-template-columns: 1fr;
      }
      .barra-lateral {
        border-right: 0;
        border-bottom: 1px solid var(--color-borde);
      }
      .menu-navegacion {
        flex-direction: row;
        flex-wrap: wrap;
      }
    }
  `
})
export class LayoutPrivadoComponent implements OnInit {
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);

  protected readonly badgeNoLeidas = signal(0);

  protected readonly iconoCalendario = Calendar;
  protected readonly iconoEventos = CalendarDays;
  protected readonly iconoTareas = CheckSquare;
  protected readonly iconoNotificaciones = Bell;
  protected readonly iconoConfiguracion = Settings;
  protected readonly iconoSalir = LogOut;

  ngOnInit(): void {
    this.refrescarBadge();
  }

  private refrescarBadge(): void {
    this.notificacionService.contarNoLeidas().subscribe({
      next: (cantidad) => this.badgeNoLeidas.set(cantidad),
      error: () => { /* silencioso — el badge no es crítico */ },
    });
  }

  protected cerrarSesion(): void {
    this.autenticacionService.cerrarSesion().subscribe({
      next: () => void this.router.navigate(['/iniciar-sesion']),
      error: () => {
        this.autenticacionService.limpiarSesion();
        void this.router.navigate(['/iniciar-sesion']);
      }
    });
  }
}
