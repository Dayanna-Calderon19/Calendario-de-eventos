import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  CalendarOptions,
  DateClickInfo,
  DateSelectInfo,
  EventClickInfo,
  EventDropInfo,
  EventHoveringInfo,
  EventInput,
  FullCalendarModule,
} from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import listPlugin from '@fullcalendar/angular/list';
import classicTheme from '@fullcalendar/angular/themes/classic';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import esLocale from 'fullcalendar/locales/es';
import { AlertCircle, CheckCircle2, LucideAngularModule, Plus, RefreshCw } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Categoria, ConfiguracionUsuario, Evento, Tarea, VistaCalendarioPreferida } from '../../core/models';
import { CategoriaService, EventoService, TareaService, UsuarioService } from '../../core/services';
import { extraerErrorApi } from '../../shared/utils/error-api.util';
import { PanelEstadisticasComponent } from '../../shared/components/panel-estadisticas.component';
import { DetalleEventoModalComponent } from './components/detalle-evento-modal.component';
import { FormularioEventoModalComponent } from './components/formulario-evento-modal.component';
import { PanelDiaComponent } from './components/panel-dia.component';

const COLORES_TIPO: Record<string, string> = {
  EVENTO: '#4f46e5',
  CITA: '#0891b2',
  FECHA_IMPORTANTE: '#d97706',
};

@Component({
  selector: 'app-calendario-page',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    LucideAngularModule,
    PanelDiaComponent,
    PanelEstadisticasComponent,
    DetalleEventoModalComponent,
    FormularioEventoModalComponent,
  ],
  template: `
    <section class="pagina-calendario">
      <header class="cabecera-seccion">
        <div>
          <h1 class="titulo-pagina">Calendario</h1>
          <p class="subtitulo-pagina">
            Visualiza y organiza tus eventos, citas y tareas por fecha.
          </p>
        </div>
        <div class="acciones-cabecera">
          <div class="leyenda-tipos" aria-label="Leyenda de tipos de evento">
            <span class="item-leyenda"><i class="punto-leyenda punto-evento"></i>Evento</span>
            <span class="item-leyenda"><i class="punto-leyenda punto-cita"></i>Cita</span>
            <span class="item-leyenda"><i class="punto-leyenda punto-importante"></i>Fecha importante</span>
            <span class="item-leyenda"><i class="punto-leyenda punto-tarea"></i>Tarea</span>
          </div>
          <button type="button" class="boton boton-primario" (click)="abrirFormularioNuevo(null)">
            <lucide-icon [img]="iconoNuevo" [size]="16" />
            <span>Nuevo evento</span>
          </button>
        </div>
      </header>

      @if (errorMensaje()) {
        <div class="alerta-error" role="alert">
          <div class="alerta-izquierda">
            <lucide-icon [img]="iconoAlerta" [size]="18" class="icono-alerta" />
            <span>{{ errorMensaje() }}</span>
          </div>
          <button type="button" class="boton-reintentar" (click)="recargarRangoActual()">
            <lucide-icon [img]="iconoRecargar" [size]="14" />
            <span>Reintentar</span>
          </button>
        </div>
      }

      @if (mensajeExito()) {
        <div class="alerta-exito" role="status">
          <lucide-icon [img]="iconoExito" [size]="18" class="icono-exito" />
          <span>{{ mensajeExito() }}</span>
        </div>
      }

      <div class="contenedor-principal">
        <div class="tarjeta contenedor-calendario">
          @if (cargando()) {
            <div class="estado-carga" role="status">
              <span class="indicador-carga"></span>
              <span>Cargando calendario…</span>
            </div>
          }
          <full-calendar [options]="opcionesCalendario()" />
        </div>

        @if (diaSeleccionado()) {
          <app-panel-dia
            [fecha]="diaSeleccionado()!"
            [eventos]="eventosDiaSeleccionado()"
            [tareas]="tareasDiaSeleccionado()"
            (cerrar)="cerrarPanel()"
            (seleccionarEvento)="abrirDetalleEvento($event)"
            (crearEvento)="abrirFormularioNuevo($event)"
          />
        }
      </div>

      <app-panel-estadisticas [actualizarTrigger]="estadisticasTrigger()" />

      @if (tooltipVisible() && eventoTooltip()) {
        <div
          class="tooltip-evento"
          [style.top.px]="tooltipY()"
          [style.left.px]="tooltipX()"
          role="tooltip"
        >
          <strong class="tooltip-titulo">{{ eventoTooltip()!.titulo }}</strong>
          @if (eventoTooltip()!.descripcion) {
            <p class="tooltip-descripcion">{{ eventoTooltip()!.descripcion }}</p>
          }
          <div class="tooltip-meta">
            <span>
              {{
                eventoTooltip()!.diaCompleto
                  ? 'Todo el día'
                  : formatearHora(eventoTooltip()!.fechaInicio) +
                    ' – ' +
                    formatearHora(eventoTooltip()!.fechaFin)
              }}
            </span>
            @if (eventoTooltip()!.ubicacion) {
              <span>{{ eventoTooltip()!.ubicacion }}</span>
            }
          </div>
        </div>
      }

      @if (eventoSeleccionado()) {
        <app-detalle-evento-modal
          [evento]="eventoSeleccionado()!"
          (cerrar)="cerrarDetalleEvento()"
          (editar)="abrirFormularioEdicion($event)"
          (eliminar)="confirmarEliminarEvento($event)"
        />
      }

      @if (formularioAbierto()) {
        <app-formulario-evento-modal
          [fechaInicial]="fechaParaNuevoEvento()"
          [eventoEditar]="eventoEnEdicion()"
          (cerrar)="cerrarFormulario()"
          (guardado)="alGuardarEvento($event)"
        />
      }
    </section>
  `,
  styles: `
    .pagina-calendario {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      position: relative;
    }

    .cabecera-seccion {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .acciones-cabecera {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .leyenda-tipos {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
    }

    .item-leyenda {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    .punto-leyenda {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }

    .punto-evento { background-color: #4f46e5; }
    .punto-cita { background-color: #0891b2; }
    .punto-importante { background-color: #d97706; }
    .punto-tarea { background-color: #16a34a; }

    .alerta-error {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
      padding: 0.75rem 1rem;
      border-radius: var(--radio-pequeno);
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      font-size: 0.875rem;
    }

    .alerta-izquierda {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .icono-alerta {
      color: var(--color-peligro);
      flex-shrink: 0;
    }

    .boton-reintentar {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radio-pequeno);
      background-color: #ffffff;
      border: 1px solid #fca5a5;
      color: #991b1b;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
    }

    .alerta-exito {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radio-pequeno);
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      font-size: 0.875rem;
    }

    .icono-exito {
      color: var(--color-exito);
      flex-shrink: 0;
    }

    .contenedor-principal {
      display: block;
    }

    .contenedor-calendario {
      overflow-x: auto;
      padding: 1rem;
      min-height: 520px;
      position: relative;
    }

    .estado-carga {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-texto-secundario);
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }

    .indicador-carga {
      width: 14px;
      height: 14px;
      border: 2px solid var(--color-primario);
      border-top-color: transparent;
      border-radius: 50%;
      animation: girar 0.6s linear infinite;
    }

    @keyframes girar {
      to { transform: rotate(360deg); }
    }

    .tooltip-evento {
      position: fixed;
      z-index: 1000;
      background: var(--color-superficie);
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-pequeno);
      box-shadow: var(--sombra-panel);
      padding: 0.75rem 1rem;
      max-width: 280px;
      pointer-events: none;
    }

    .tooltip-titulo {
      display: block;
      font-size: 0.9375rem;
      color: var(--color-texto);
      margin-bottom: 0.25rem;
    }

    .tooltip-descripcion {
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
      margin-bottom: 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tooltip-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
    }

    .boton {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radio-pequeno);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: background-color var(--transicion-base);
    }

    .boton-primario {
      background-color: var(--color-primario);
      color: #ffffff;
    }

    .boton-primario:hover {
      background-color: var(--color-primario-hover);
    }
  `,
})
export class CalendarioPageComponent implements OnInit {
  private readonly eventoService = inject(EventoService);
  private readonly tareaService = inject(TareaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly categoriaService = inject(CategoriaService);

  protected readonly iconoNuevo = Plus;
  protected readonly iconoAlerta = AlertCircle;
  protected readonly iconoExito = CheckCircle2;
  protected readonly iconoRecargar = RefreshCw;

  protected readonly cargando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);
  protected readonly diaSeleccionado = signal<string | null>(null);
  protected readonly eventosCache = signal<Evento[]>([]);
  protected readonly tareasCache = signal<Tarea[]>([]);
  protected readonly eventoSeleccionado = signal<Evento | null>(null);
  protected readonly formularioAbierto = signal(false);
  protected readonly fechaParaNuevoEvento = signal<string | null>(null);
  protected readonly eventoEnEdicion = signal<Evento | null>(null);
  protected readonly tooltipVisible = signal(false);
  protected readonly eventoTooltip = signal<Evento | null>(null);
  protected readonly tooltipX = signal(0);
  protected readonly tooltipY = signal(0);
  protected readonly estadisticasTrigger = signal(0);

  private rangoActual: { inicio: string; fin: string } | null = null;
  private formato12Horas = false;
  private categoriasPorId = new Map<string, Categoria>();

  ngOnInit(): void {
    this.cargarPreferenciasUsuario();
  }

  protected readonly eventosDiaSeleccionado = computed(() => {
    const dia = this.diaSeleccionado();
    if (!dia) return [];
    return this.eventosCache().filter((evento) => {
      const inicio = evento.fechaInicio.substring(0, 10);
      const fin = evento.fechaFin.substring(0, 10);
      return inicio <= dia && dia <= fin;
    });
  });

  protected readonly tareasDiaSeleccionado = computed(() => {
    const dia = this.diaSeleccionado();
    if (!dia) return [];
    return this.tareasCache().filter(
      (tarea) => tarea.fechaLimite && tarea.fechaLimite.substring(0, 10) === dia
    );
  });

  protected readonly opcionesCalendario = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, classicTheme],
    locale: esLocale,
    initialView: 'dayGridMonth',
    firstDay: 1,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    nowIndicator: true,
    dayMaxEvents: true,
    eventDisplay: 'block',
    height: 'auto',
    events: [],
    dateClick: (arg: DateClickInfo) => this.alHacerClickEnDia(arg),
    select: (arg: DateSelectInfo) => this.alSeleccionarDia(arg),
    eventClick: (arg: EventClickInfo) => this.alHacerClickEnEvento(arg),
    eventDrop: (arg: EventDropInfo) => this.alReprogramarEvento(arg),
    eventMouseEnter: (arg: EventHoveringInfo) => this.mostrarTooltip(arg),
    eventMouseLeave: () => this.ocultarTooltip(),
    datesSet: (arg) => this.cargarElementosCalendario(arg.startStr, arg.endStr),
  });

  protected cerrarPanel(): void {
    this.diaSeleccionado.set(null);
  }

  protected abrirDetalleEvento(evento: Evento): void {
    this.eventoSeleccionado.set(evento);
  }

  protected cerrarDetalleEvento(): void {
    this.eventoSeleccionado.set(null);
  }

  protected abrirFormularioNuevo(fecha: string | null): void {
    this.eventoEnEdicion.set(null);
    this.fechaParaNuevoEvento.set(fecha ?? this.diaSeleccionado());
    this.formularioAbierto.set(true);
  }

  protected abrirFormularioEdicion(evento: Evento): void {
    this.eventoSeleccionado.set(null);
    this.eventoEnEdicion.set(evento);
    this.fechaParaNuevoEvento.set(null);
    this.formularioAbierto.set(true);
  }

  protected cerrarFormulario(): void {
    this.formularioAbierto.set(false);
    this.eventoEnEdicion.set(null);
    this.fechaParaNuevoEvento.set(null);
  }

  protected alGuardarEvento(eventoGuardado: Evento): void {
    const fueEdicion = Boolean(this.eventoEnEdicion());
    this.cerrarFormulario();
    this.diaSeleccionado.set(eventoGuardado.fechaInicio.substring(0, 10));
    this.mostrarExitoTemporal(
      fueEdicion ? 'Evento actualizado correctamente.' : 'Evento creado correctamente.'
    );
    this.estadisticasTrigger.update((n) => n + 1);
    this.recargarRangoActual();
  }

  protected confirmarEliminarEvento(evento: Evento): void {
    this.eventoService.eliminarEvento(evento.id).subscribe({
      next: () => {
        this.cerrarDetalleEvento();
        this.mostrarExitoTemporal('Evento eliminado correctamente.');
        this.estadisticasTrigger.update((n) => n + 1);
        this.recargarRangoActual();
      },
      error: (err) => {
        const errorApi = extraerErrorApi(err, 'No se pudo eliminar el evento.');
        this.errorMensaje.set(errorApi.mensaje);
        this.cerrarDetalleEvento();
      },
    });
  }

  protected recargarRangoActual(): void {
    if (this.rangoActual) {
      this.cargarElementosCalendario(this.rangoActual.inicio, this.rangoActual.fin);
    }
  }

  protected formatearHora(fechaIso: string): string {
    return new Date(fechaIso).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: this.formato12Horas,
    });
  }

  private cargarPreferenciasUsuario(): void {
    this.usuarioService.obtenerConfiguracion().subscribe({
      next: (config: ConfiguracionUsuario) => {
        const mapaVistas: Record<VistaCalendarioPreferida, string> = {
          MES: 'dayGridMonth',
          SEMANA: 'timeGridWeek',
          DIA: 'timeGridDay',
          AGENDA: 'listWeek',
        };
        this.formato12Horas = config.formatoHorario === 'H12';
        this.opcionesCalendario.update((ops) => ({
          ...ops,
          firstDay: config.primerDiaSemana === 'DOMINGO' ? 0 : 1,
          initialView: mapaVistas[config.vistaPreferida] ?? 'dayGridMonth',
          eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: this.formato12Horas,
          },
          slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: this.formato12Horas,
          },
        }));
      },
      error: () => {
        // Si falla la carga de preferencias, se mantienen los valores por defecto del calendario.
      },
    });
  }

  private alHacerClickEnDia(arg: DateClickInfo): void {
    this.diaSeleccionado.set(arg.dateStr.substring(0, 10));
  }

  private alSeleccionarDia(arg: DateSelectInfo): void {
    this.diaSeleccionado.set(arg.startStr.substring(0, 10));
  }

  private alHacerClickEnEvento(arg: EventClickInfo): void {
    const evento = this.eventosCache().find((e) => e.id === arg.event.id);
    if (evento) {
      this.diaSeleccionado.set(evento.fechaInicio.substring(0, 10));
      this.eventoSeleccionado.set(evento);
      return;
    }

    const tarea = this.tareasCache().find((t) => `tarea-${t.id}` === arg.event.id);
    if (tarea && tarea.fechaLimite) {
      this.diaSeleccionado.set(tarea.fechaLimite.substring(0, 10));
    }
  }

  private alReprogramarEvento(arg: EventDropInfo): void {
    const eventoId = arg.event.id;
    if (eventoId.startsWith('tarea-')) {
      arg.revert();
      return;
    }

    const nuevaInicio = arg.event.startStr;
    const nuevaFin = arg.event.endStr || nuevaInicio;
    const diaCompleto = arg.event.allDay;

    this.errorMensaje.set(null);
    this.eventoService
      .reprogramarEvento(eventoId, {
        fechaInicio: nuevaInicio,
        fechaFin: nuevaFin,
        diaCompleto,
      })
      .subscribe({
        next: (eventoActualizado) => {
          this.eventosCache.update((lista) =>
            lista.map((e) => (e.id === eventoActualizado.id ? eventoActualizado : e))
          );
          this.estadisticasTrigger.update((n) => n + 1);
          this.mostrarExitoTemporal('Evento reprogramado correctamente.');
        },
        error: (err) => {
          arg.revert();
          const errorApi = extraerErrorApi(
            err,
            'No se pudo reprogramar el evento. Se restauró la fecha anterior.'
          );
          this.errorMensaje.set(errorApi.mensaje);
        },
      });
  }

  private mostrarTooltip(arg: EventHoveringInfo): void {
    const evento = this.eventosCache().find((e) => e.id === arg.event.id);
    if (!evento) return;

    this.eventoTooltip.set(evento);
    this.tooltipX.set(arg.jsEvent.clientX + 12);
    this.tooltipY.set(arg.jsEvent.clientY + 12);
    this.tooltipVisible.set(true);
  }

  private ocultarTooltip(): void {
    this.tooltipVisible.set(false);
    this.eventoTooltip.set(null);
  }

  private mostrarExitoTemporal(mensaje: string): void {
    this.mensajeExito.set(mensaje);
    setTimeout(() => {
      if (this.mensajeExito() === mensaje) {
        this.mensajeExito.set(null);
      }
    }, 4000);
  }

  private cargarElementosCalendario(inicio: string, fin: string): void {
    this.rangoActual = { inicio, fin };
    this.cargando.set(true);
    this.errorMensaje.set(null);

    let errorCarga: unknown = null;

    forkJoin({
      eventos: this.eventoService.obtenerEventosCalendario(inicio, fin).pipe(
        catchError((err) => {
          errorCarga = err;
          return of([] as Evento[]);
        })
      ),
      tareas: this.tareaService.listarTareas().pipe(
        catchError(() => of([] as Tarea[]))
      ),
      categorias: this.categoriaService.listarCategorias().pipe(
        catchError(() => of([] as Categoria[]))
      ),
    }).subscribe(({ eventos, tareas, categorias }) => {
      this.eventosCache.set(eventos);
      this.tareasCache.set(tareas);
      this.categoriasPorId = new Map(categorias.map((c) => [c.id, c]));

      if (errorCarga) {
        const errorApi = extraerErrorApi(
          errorCarga,
          'No se pudieron cargar los eventos del calendario.'
        );
        this.errorMensaje.set(errorApi.mensaje);
      }

      const eventosCalendario = [
        ...eventos.map((e) => this.aEventoCalendario(e)),
        ...tareas
          .filter((t) => Boolean(t.fechaLimite))
          .map((t) => this.aTareaCalendario(t)),
      ];

      this.opcionesCalendario.update((ops) => ({
        ...ops,
        events: eventosCalendario,
      }));
      this.cargando.set(false);
    });
  }

  private aEventoCalendario(evento: Evento): EventInput {
    const color = evento.color ?? COLORES_TIPO[evento.tipo] ?? '#4f46e5';
    return {
      id: evento.id,
      title: evento.titulo,
      start: evento.fechaInicio,
      end: evento.fechaFin,
      allDay: evento.diaCompleto,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { tipo: evento.tipo },
    };
  }

  private aTareaCalendario(tarea: Tarea): EventInput {
    const colorCategoria = tarea.categoriaId
      ? this.categoriasPorId.get(tarea.categoriaId)?.color
      : undefined;
    const color = tarea.vencida ? '#dc2626' : (colorCategoria ?? '#16a34a');
    return {
      id: `tarea-${tarea.id}`,
      title: `Tarea: ${tarea.titulo}`,
      start: tarea.fechaLimite!.substring(0, 10),
      allDay: true,
      editable: false,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { tipo: 'TAREA' },
    };
  }
}
