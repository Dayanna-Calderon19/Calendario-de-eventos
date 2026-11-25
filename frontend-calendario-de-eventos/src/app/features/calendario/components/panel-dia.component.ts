import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, CalendarPlus, CheckCircle2, Clock, X } from 'lucide-angular';
import { Evento, Tarea } from '../../../core/models';

const COLORES_TIPO: Record<string, string> = {
  EVENTO: '#4f46e5',
  CITA: '#0891b2',
  FECHA_IMPORTANTE: '#d97706',
};

const ETIQUETAS_TIPO: Record<string, string> = {
  EVENTO: 'Evento',
  CITA: 'Cita',
  FECHA_IMPORTANTE: 'Fecha importante',
};

const ETIQUETAS_PRIORIDAD: Record<string, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada',
};

@Component({
  selector: 'app-panel-dia',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="fondo-panel"
      (click)="cerrar.emit()"
      (keydown.escape)="cerrar.emit()"
    >
      <aside
        class="panel-lateral"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del día seleccionado"
        (click)="$event.stopPropagation()"
      >
        <header class="panel-cabecera">
          <div class="cabecera-texto">
            <span class="etiqueta-fecha">Resumen del día</span>
            <h2 class="panel-titulo">{{ fechaFormateada() }}</h2>
          </div>
          <button
            type="button"
            class="boton-cerrar"
            (click)="cerrar.emit()"
            aria-label="Cerrar panel del día"
          >
            <lucide-icon [img]="iconoCerrar" [size]="20" />
          </button>
        </header>

        <div class="panel-acciones">
          <button
            type="button"
            class="boton-accion-panel"
            (click)="crearEvento.emit(fecha())"
          >
            <lucide-icon [img]="iconoNuevoEvento" [size]="16" />
            <span>Crear evento para este día</span>
          </button>
        </div>

        <div class="panel-cuerpo">
          <section class="panel-bloque">
            <h3 class="subtitulo-bloque">Eventos ({{ eventos().length }})</h3>
            @if (eventos().length === 0) {
              <p class="sin-elementos">Sin eventos programados para este día.</p>
            } @else {
              <ul class="lista-elementos" role="list">
                @for (evento of eventos(); track evento.id) {
                  <li
                    class="item-evento"
                    [style.border-left-color]="obtenerColorEvento(evento)"
                    (click)="seleccionarEvento.emit(evento)"
                    (keydown.enter)="seleccionarEvento.emit(evento)"
                    tabindex="0"
                    role="button"
                  >
                    <span class="elemento-hora">
                      <lucide-icon [img]="iconoReloj" [size]="13" />
                      {{ evento.diaCompleto ? 'Todo el día' : formatearHora(evento.fechaInicio) }}
                    </span>
                    <span class="elemento-titulo">{{ evento.titulo }}</span>
                    <span class="etiqueta-tipo" [style.background-color]="obtenerColorEvento(evento)">
                      {{ obtenerEtiquetaTipo(evento.tipo) }}
                    </span>
                  </li>
                }
              </ul>
            }
          </section>

          <section class="panel-bloque">
            <h3 class="subtitulo-bloque">Tareas ({{ tareas().length }})</h3>
            @if (tareas().length === 0) {
              <p class="sin-elementos">Sin tareas con fecha límite este día.</p>
            } @else {
              <ul class="lista-elementos" role="list">
                @for (tarea of tareas(); track tarea.id) {
                  <li class="item-tarea" [class.tarea-vencida]="tarea.vencida">
                    <div class="tarea-cabecera">
                      <lucide-icon [img]="iconoTarea" [size]="15" />
                      <span class="elemento-titulo">{{ tarea.titulo }}</span>
                    </div>
                    <div class="tarea-meta">
                      <span class="etiqueta-prioridad">{{ obtenerEtiquetaPrioridad(tarea.prioridad) }}</span>
                      <span class="estado-tarea">{{ obtenerEtiquetaEstado(tarea.estado) }}</span>
                    </div>
                  </li>
                }
              </ul>
            }
          </section>
        </div>
      </aside>
    </div>
  `,
  styles: `
    .fondo-panel {
      position: fixed;
      inset: 0;
      z-index: 1050;
      background-color: rgb(15 23 42 / 35%);
      display: flex;
      justify-content: flex-end;
    }

    .panel-lateral {
      width: min(390px, 100vw);
      height: 100dvh;
      background-color: var(--color-superficie);
      border-left: 1px solid var(--color-borde);
      box-shadow: -8px 0 28px rgb(15 23 42 / 14%);
      display: flex;
      flex-direction: column;
      animation: deslizarDerecha 180ms ease-out;
    }

    @keyframes deslizarDerecha {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .panel-cabecera {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1.25rem 1.25rem 1rem;
      border-bottom: 1px solid var(--color-borde);
    }

    .cabecera-texto {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .etiqueta-fecha {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-primario);
    }

    .panel-titulo {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--color-texto);
      text-transform: capitalize;
      line-height: 1.3;
    }

    .boton-cerrar {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-texto-secundario);
      padding: 0.375rem;
      border-radius: var(--radio-pequeno);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .boton-cerrar:hover {
      color: var(--color-texto);
      background-color: var(--color-superficie-secundaria);
    }

    .panel-acciones {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--color-borde);
    }

    .boton-accion-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.625rem 0.875rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid transparent;
      background-color: var(--color-primario);
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transicion-base);
    }

    .boton-accion-panel:hover {
      background-color: var(--color-primario-hover);
    }

    .panel-cuerpo {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .panel-bloque {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .subtitulo-bloque {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-texto-secundario);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .sin-elementos {
      color: var(--color-texto-secundario);
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
      background-color: var(--color-superficie-secundaria);
      border-radius: var(--radio-pequeno);
    }

    .lista-elementos {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .item-evento {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      border-left: 3px solid var(--color-primario);
      padding: 0.625rem 0.75rem;
      border-radius: 0 var(--radio-pequeno) var(--radio-pequeno) 0;
      background-color: var(--color-superficie-secundaria);
      cursor: pointer;
      transition: background-color var(--transicion-base);
    }

    .item-evento:hover,
    .item-evento:focus {
      background-color: var(--color-primario-suave);
      outline: none;
    }

    .elemento-hora {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--color-texto-secundario);
    }

    .elemento-titulo {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-texto);
    }

    .etiqueta-tipo {
      align-self: flex-start;
      font-size: 0.6875rem;
      color: #ffffff;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-weight: 500;
    }

    .item-tarea {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.625rem 0.75rem;
      border-radius: var(--radio-pequeno);
      background-color: var(--color-superficie-secundaria);
      border-left: 3px solid var(--color-exito);
    }

    .item-tarea.tarea-vencida {
      border-left-color: var(--color-peligro);
    }

    .tarea-cabecera {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--color-texto);
    }

    .tarea-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--color-texto-secundario);
    }
  `,
})
export class PanelDiaComponent {
  readonly fecha = input.required<string>();
  readonly eventos = input.required<Evento[]>();
  readonly tareas = input.required<Tarea[]>();

  readonly cerrar = output<void>();
  readonly seleccionarEvento = output<Evento>();
  readonly crearEvento = output<string>();

  protected readonly iconoCerrar = X;
  protected readonly iconoNuevoEvento = CalendarPlus;
  protected readonly iconoReloj = Clock;
  protected readonly iconoTarea = CheckCircle2;

  protected readonly fechaFormateada = computed(() =>
    new Date(`${this.fecha()}T12:00:00`).toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );

  protected obtenerColorEvento(evento: Evento): string {
    return evento.color ?? COLORES_TIPO[evento.tipo] ?? '#4f46e5';
  }

  protected obtenerEtiquetaTipo(tipo: string): string {
    return ETIQUETAS_TIPO[tipo] ?? tipo;
  }

  protected obtenerEtiquetaPrioridad(prioridad: string): string {
    return ETIQUETAS_PRIORIDAD[prioridad] ?? prioridad;
  }

  protected obtenerEtiquetaEstado(estado: string): string {
    return ETIQUETAS_ESTADO[estado] ?? estado;
  }

  protected formatearHora(fechaIso: string): string {
    return new Date(fechaIso).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
