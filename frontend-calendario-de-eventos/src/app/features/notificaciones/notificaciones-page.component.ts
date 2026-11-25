import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCheck,
  LucideAngularModule,
  RefreshCw,
  Trash2,
} from 'lucide-angular';
import { Notificacion } from '../../core/models';
import { NotificacionService } from '../../core/services';

@Component({
  selector: 'app-notificaciones-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <section class="pagina-seccion">
      <header class="cabecera-seccion">
        <div class="titulo-grupo">
          <h1 class="titulo-pagina">Notificaciones</h1>
          @if (cantidadNoLeidas() > 0) {
            <span class="badge-cantidad" aria-label="{{ cantidadNoLeidas() }} sin leer">
              {{ cantidadNoLeidas() }}
            </span>
          }
        </div>
        <div class="acciones-cabecera">
          @if (cantidadNoLeidas() > 0) {
            <button
              type="button"
              class="boton-accion-cabecera"
              (click)="marcarTodasLeidas()"
              [disabled]="marcandoTodas()"
              title="Marcar todas como leídas"
            >
              <lucide-icon [img]="iconoMarcarTodas" [size]="16" />
              <span>Marcar todas leídas</span>
            </button>
          }
          <button
            type="button"
            class="boton-icono"
            (click)="cargarNotificaciones()"
            [disabled]="cargando()"
            title="Recargar notificaciones"
            aria-label="Recargar"
          >
            <lucide-icon [img]="iconoRecargar" [size]="18" />
          </button>
        </div>
      </header>

      @if (errorMensaje()) {
        <div class="alerta-error" role="alert">
          <lucide-icon [img]="iconoError" [size]="18" />
          <span>{{ errorMensaje() }}</span>
          <button type="button" class="boton-reintentar" (click)="cargarNotificaciones()">
            Reintentar
          </button>
        </div>
      }

      @if (cargando()) {
        <div class="estado-carga" aria-live="polite" aria-busy="true">
          <div class="spinner" aria-hidden="true"></div>
          <span>Cargando notificaciones…</span>
        </div>
      } @else if (notificaciones().length === 0 && !errorMensaje()) {
        <div class="estado-vacio">
          <lucide-icon [img]="iconoSinNotificaciones" [size]="40" class="icono-vacio" />
          <p class="titulo-vacio">No tienes notificaciones</p>
          <p class="descripcion-vacio">
            Cuando se active un recordatorio programado, verás la notificación aquí.
          </p>
        </div>
      } @else {
        <ul class="lista-notificaciones" role="list" aria-label="Lista de notificaciones">
          @for (notif of notificaciones(); track notif.id) {
            <li
              class="tarjeta-notificacion"
              [class.no-leida]="!notif.leida"
              [class.eliminando]="eliminandoId() === notif.id"
            >
              <div class="notif-contenido">
                @if (!notif.leida) {
                  <span class="punto-no-leida" aria-label="Sin leer"></span>
                }
                <div class="notif-cuerpo">
                  <p class="notif-titulo">{{ notif.titulo }}</p>
                  <p class="notif-mensaje">{{ notif.mensaje }}</p>
                  <time class="notif-fecha" [dateTime]="notif.fechaCreacion">
                    {{ formatearFechaRelativa(notif.fechaCreacion) }}
                  </time>
                </div>
              </div>
              <div class="notif-acciones">
                @if (!notif.leida) {
                  <button
                    type="button"
                    class="boton-accion-notif"
                    (click)="marcarComoLeida(notif)"
                    title="Marcar como leída"
                    aria-label="Marcar '{{ notif.titulo }}' como leída"
                  >
                    <lucide-icon [img]="iconoLeida" [size]="15" />
                  </button>
                }
                <button
                  type="button"
                  class="boton-accion-notif peligro"
                  (click)="solicitarEliminacion(notif)"
                  title="Eliminar notificación"
                  aria-label="Eliminar notificación '{{ notif.titulo }}'"
                >
                  <lucide-icon [img]="iconoEliminar" [size]="15" />
                </button>
              </div>

              @if (confirmandoEliminacionId() === notif.id) {
                <div class="confirmacion-eliminar" role="alert">
                  <span>¿Eliminar esta notificación?</span>
                  <div class="acciones-confirmacion">
                    <button
                      type="button"
                      class="boton-cancelar-confirmacion"
                      (click)="cancelarEliminacion()"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      class="boton-confirmar-eliminacion"
                      (click)="confirmarEliminacion(notif.id)"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              }
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .pagina-seccion {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 680px;
    }
    .cabecera-seccion {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .titulo-grupo {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }
    .titulo-pagina {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--color-texto);
    }
    .badge-cantidad {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.375rem;
      height: 1.375rem;
      padding: 0 0.375rem;
      border-radius: 999px;
      background-color: var(--color-primario);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .acciones-cabecera {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .boton-accion-cabecera {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.4375rem 0.75rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transicion-base);
    }
    .boton-accion-cabecera:hover:not(:disabled) {
      background-color: var(--color-primario-suave);
      color: var(--color-primario);
    }
    .boton-accion-cabecera:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .boton-icono {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto-secundario);
      cursor: pointer;
      transition: background-color var(--transicion-base), color var(--transicion-base);
    }
    .boton-icono:hover:not(:disabled) {
      background-color: var(--color-primario-suave);
      color: var(--color-primario);
    }
    .boton-icono:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .alerta-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radio-pequeno);
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      font-size: 0.875rem;
    }
    .boton-reintentar {
      margin-left: auto;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #991b1b;
      text-decoration: underline;
      background: none;
      border: none;
      cursor: pointer;
    }
    .estado-carga {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      justify-content: center;
      color: var(--color-texto-secundario);
    }
    .spinner {
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid var(--color-borde);
      border-top-color: var(--color-primario);
      border-radius: 50%;
      animation: girar 0.8s linear infinite;
    }
    @keyframes girar { to { transform: rotate(360deg); } }
    .estado-vacio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--color-texto-secundario);
    }
    .icono-vacio {
      opacity: 0.3;
    }
    .titulo-vacio {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-texto-secundario);
    }
    .descripcion-vacio {
      font-size: 0.875rem;
      max-width: 340px;
    }
    .lista-notificaciones {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .tarjeta-notificacion {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radio-medio);
      background-color: var(--color-superficie);
      border: 1px solid var(--color-borde);
      transition: opacity 0.2s;
    }
    .tarjeta-notificacion.no-leida {
      border-left: 3px solid var(--color-primario);
      background-color: var(--color-primario-suave, #eef2ff);
    }
    .tarjeta-notificacion.eliminando {
      opacity: 0.4;
      pointer-events: none;
    }
    .notif-contenido {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
    }
    .punto-no-leida {
      flex-shrink: 0;
      margin-top: 0.3rem;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--color-primario);
    }
    .notif-cuerpo {
      flex: 1;
      min-width: 0;
    }
    .notif-titulo {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-texto);
      margin: 0;
    }
    .notif-mensaje {
      font-size: 0.875rem;
      color: var(--color-texto-secundario);
      margin: 0.25rem 0 0;
    }
    .notif-fecha {
      display: block;
      font-size: 0.75rem;
      color: var(--color-texto-secundario);
      margin-top: 0.375rem;
      opacity: 0.75;
    }
    .notif-acciones {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      justify-content: flex-end;
    }
    .boton-accion-notif {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto-secundario);
      cursor: pointer;
      transition: background-color var(--transicion-base), color var(--transicion-base);
    }
    .boton-accion-notif:hover {
      background-color: var(--color-primario-suave);
      color: var(--color-primario);
    }
    .boton-accion-notif.peligro:hover {
      background-color: #fef2f2;
      color: var(--color-peligro);
      border-color: #fecaca;
    }
    .confirmacion-eliminar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: var(--radio-pequeno);
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      font-size: 0.8125rem;
    }
    .acciones-confirmacion {
      display: flex;
      gap: 0.375rem;
    }
    .boton-cancelar-confirmacion,
    .boton-confirmar-eliminacion {
      padding: 0.3125rem 0.625rem;
      border-radius: var(--radio-pequeno);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
    }
    .boton-cancelar-confirmacion {
      background-color: transparent;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .boton-confirmar-eliminacion {
      background-color: var(--color-peligro);
      border: 1px solid var(--color-peligro);
      color: #fff;
    }
  `,
})
export class NotificacionesPageComponent implements OnInit {
  private readonly notificacionService = inject(NotificacionService);

  protected readonly notificaciones = signal<Notificacion[]>([]);
  protected readonly cargando = signal(false);
  protected readonly marcandoTodas = signal(false);
  protected readonly errorMensaje = signal('');
  protected readonly confirmandoEliminacionId = signal<string | null>(null);
  protected readonly eliminandoId = signal<string | null>(null);

  protected readonly iconoBell = Bell;
  protected readonly iconoSinNotificaciones = BellOff;
  protected readonly iconoMarcarTodas = CheckCheck;
  protected readonly iconoEliminar = Trash2;
  protected readonly iconoLeida = CheckCheck;
  protected readonly iconoError = AlertCircle;
  protected readonly iconoRecargar = RefreshCw;

  protected cantidadNoLeidas(): number {
    return this.notificaciones().filter(n => !n.leida).length;
  }

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  protected cargarNotificaciones(): void {
    this.cargando.set(true);
    this.errorMensaje.set('');
    this.notificacionService.listarNotificaciones().subscribe({
      next: (lista) => {
        this.notificaciones.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.errorMensaje.set('No se pudieron cargar las notificaciones. Verifica tu conexión e inténtalo nuevamente.');
        this.cargando.set(false);
      },
    });
  }

  protected marcarComoLeida(notif: Notificacion): void {
    // optimistic update
    this.notificaciones.update(lista =>
      lista.map(n => n.id === notif.id ? { ...n, leida: true } : n)
    );
    this.notificacionService.marcarComoLeida(notif.id).subscribe({
      error: () => {
        // rollback
        this.notificaciones.update(lista =>
          lista.map(n => n.id === notif.id ? { ...n, leida: false } : n)
        );
        this.errorMensaje.set('No se pudo marcar la notificación como leída.');
      },
    });
  }

  protected marcarTodasLeidas(): void {
    this.marcandoTodas.set(true);
    this.notificacionService.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.notificaciones.update(lista => lista.map(n => ({ ...n, leida: true })));
        this.marcandoTodas.set(false);
      },
      error: () => {
        this.errorMensaje.set('No se pudieron marcar todas las notificaciones como leídas.');
        this.marcandoTodas.set(false);
      },
    });
  }

  protected solicitarEliminacion(notif: Notificacion): void {
    this.confirmandoEliminacionId.set(notif.id);
  }

  protected cancelarEliminacion(): void {
    this.confirmandoEliminacionId.set(null);
  }

  protected confirmarEliminacion(id: string): void {
    this.confirmandoEliminacionId.set(null);
    this.eliminandoId.set(id);
    this.notificacionService.eliminarNotificacion(id).subscribe({
      next: () => {
        this.notificaciones.update(lista => lista.filter(n => n.id !== id));
        this.eliminandoId.set(null);
      },
      error: () => {
        this.eliminandoId.set(null);
        this.errorMensaje.set('No se pudo eliminar la notificación. Inténtalo nuevamente.');
      },
    });
  }

  protected formatearFechaRelativa(fechaIso: string): string {
    const diff = Date.now() - new Date(fechaIso).getTime();
    const minutos = Math.floor(diff / 60000);
    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return new Date(fechaIso).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
