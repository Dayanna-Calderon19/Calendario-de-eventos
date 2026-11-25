import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ListTodo,
  LucideAngularModule,
  MapPin,
  RefreshCw,
  TrendingUp,
} from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Evento, Tarea, TipoEvento } from '../../core/models';
import { EventoService, TareaService } from '../../core/services';
import { extraerErrorApi } from '../utils/error-api.util';
import { CargandoComponent } from './cargando.component';
import { EstadoVacioComponent } from './estado-vacio.component';

type PeriodoTareas = 'MES' | 'SEMANA' | 'TODO';

const ETIQUETAS_TIPO: Record<TipoEvento, string> = {
  EVENTO: 'Evento',
  CITA: 'Cita',
  FECHA_IMPORTANTE: 'Fecha importante',
};

@Component({
  selector: 'app-panel-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CargandoComponent,
    EstadoVacioComponent,
  ],
  template: `
    <section class="panel-estadisticas tarjeta" aria-labelledby="titulo-panel-estadisticas">
      <header class="cabecera-panel">
        <div class="titulo-bloque">
          <div class="icono-titulo">
            <lucide-icon [img]="iconoEstadisticas" [size]="20" />
          </div>
          <div>
            <h2 id="titulo-panel-estadisticas" class="titulo-panel">Panel y estadísticas</h2>
            <p class="subtitulo-panel">
              Resumen de hoy ({{ etiquetaHoy() }}) y métricas de actividad
            </p>
          </div>
        </div>

        <div class="controles-panel">
          <div class="selector-mes" aria-label="Mes seleccionado">
            <button
              type="button"
              class="boton-icono"
              (click)="cambiarMes(-1)"
              aria-label="Mes anterior"
              title="Mes anterior"
            >
              <lucide-icon [img]="iconoAnterior" [size]="16" />
            </button>
            <span class="etiqueta-mes">{{ etiquetaMesSeleccionado() }}</span>
            <button
              type="button"
              class="boton-icono"
              (click)="cambiarMes(1)"
              aria-label="Mes siguiente"
              title="Mes siguiente"
            >
              <lucide-icon [img]="iconoSiguiente" [size]="16" />
            </button>
          </div>

          <button
            type="button"
            class="boton-refrescar"
            (click)="cargarEstadisticas()"
            [disabled]="cargando()"
            title="Actualizar estadísticas"
          >
            <lucide-icon [img]="iconoRecargar" [size]="15" />
            <span>Actualizar</span>
          </button>
        </div>
      </header>

      @if (errorMensaje()) {
        <div class="alerta-error" role="alert">
          <div class="alerta-izquierda">
            <lucide-icon [img]="iconoAlerta" [size]="18" />
            <span>{{ errorMensaje() }}</span>
          </div>
          <button type="button" class="boton-reintentar" (click)="cargarEstadisticas()">
            <lucide-icon [img]="iconoRecargar" [size]="14" />
            <span>Reintentar</span>
          </button>
        </div>
      }

      @if (cargando()) {
        <app-cargando mensaje="Calculando estadísticas del calendario y tareas..." />
      } @else {
        <!-- Tarjetas de métricas principales (RF-071 a RF-075) -->
        <div class="rejilla-metricas">
          <article class="tarjeta-metrica metrica-hoy">
            <div class="metrica-cabecera">
              <span class="metrica-etiqueta">Programado para hoy</span>
              <lucide-icon [img]="iconoHoy" [size]="18" class="metrica-icono" />
            </div>
            <strong class="metrica-valor">{{ totalElementosHoy() }}</strong>
            <span class="metrica-detalle">
              {{ eventosHoy().length }} {{ eventosHoy().length === 1 ? 'evento' : 'eventos' }} ·
              {{ tareasHoy().length }} {{ tareasHoy().length === 1 ? 'tarea' : 'tareas' }}
            </span>
          </article>

          <article class="tarjeta-metrica metrica-mes">
            <div class="metrica-cabecera">
              <span class="metrica-etiqueta">Eventos del mes</span>
              <lucide-icon [img]="iconoCalendario" [size]="18" class="metrica-icono" />
            </div>
            <strong class="metrica-valor">{{ eventosMes().length }}</strong>
            <span class="metrica-detalle">En {{ etiquetaMesSeleccionado() }}</span>
          </article>

          <article class="tarjeta-metrica metrica-pendientes">
            <div class="metrica-cabecera">
              <span class="metrica-etiqueta">Tareas pendientes</span>
              <lucide-icon [img]="iconoTareas" [size]="18" class="metrica-icono" />
            </div>
            <strong class="metrica-valor">{{ tareasPendientes() }}</strong>
            <span class="metrica-detalle">
              {{ tareasEnProgreso() }} en progreso
            </span>
          </article>

          <article class="tarjeta-metrica metrica-completadas">
            <div class="metrica-cabecera">
              <span class="metrica-etiqueta">Tareas completadas</span>
              <lucide-icon [img]="iconoCompletada" [size]="18" class="metrica-icono" />
            </div>
            <strong class="metrica-valor">{{ tareasCompletadas() }}</strong>
            <span class="metrica-detalle">De {{ tareas().length }} totales</span>
          </article>

          <article
            class="tarjeta-metrica"
            [class.metrica-vencidas-alerta]="tareasVencidas() > 0"
          >
            <div class="metrica-cabecera">
              <span class="metrica-etiqueta">Tareas vencidas</span>
              <lucide-icon [img]="iconoVencida" [size]="18" class="metrica-icono" />
            </div>
            <strong class="metrica-valor">{{ tareasVencidas() }}</strong>
            <span class="metrica-detalle">
              {{ tareasVencidas() > 0 ? 'Requieren atención' : 'Todo al día' }}
            </span>
          </article>
        </div>

        <!-- Progreso de tareas por periodo (RF-077) + Resumen de hoy y próximos eventos (RF-071, RF-076) -->
        <div class="rejilla-detalle">
          <div class="bloque-detalle">
            <div class="bloque-cabecera">
              <div class="bloque-titulo">
                <lucide-icon [img]="iconoTendencia" [size]="18" />
                <h3>Cumplimiento de tareas</h3>
              </div>

              <select
                class="selector-periodo"
                [ngModel]="periodoSeleccionado()"
                (ngModelChange)="periodoSeleccionado.set($event)"
                aria-label="Seleccionar periodo de cumplimiento de tareas"
              >
                <option value="MES">Mes seleccionado</option>
                <option value="SEMANA">Últimos 7 días</option>
                <option value="TODO">Todo el historial</option>
              </select>
            </div>

            <div class="progreso-contenedor">
              <div class="progreso-cifras">
                <span class="progreso-porcentaje">{{ porcentajeCompletadoPeriodo() }}%</span>
                <span class="progreso-texto">
                  {{ resumenPeriodo().completadas }} de {{ resumenPeriodo().total }} tareas completadas
                </span>
              </div>
              <div
                class="barra-progreso"
                role="progressbar"
                [attr.aria-valuenow]="porcentajeCompletadoPeriodo()"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  class="barra-progreso-relleno"
                  [style.width.%]="porcentajeCompletadoPeriodo()"
                ></div>
              </div>
            </div>

            <div class="resumen-hoy-lista">
              <h4 class="subtitulo-bloque">Agenda de hoy</h4>
              @if (totalElementosHoy() === 0) {
                <p class="texto-vacio-compacto">No hay eventos ni tareas programadas para hoy.</p>
              } @else {
                <ul class="lista-compacta">
                  @for (evento of eventosHoy().slice(0, 3); track evento.id) {
                    <li class="item-compacto">
                      <span
                        class="punto-color"
                        [style.background-color]="evento.color || '#4f46e5'"
                      ></span>
                      <span class="item-titulo">{{ evento.titulo }}</span>
                      <span class="item-hora">
                        {{ evento.diaCompleto ? 'Todo el día' : formatearHora(evento.fechaInicio) }}
                      </span>
                    </li>
                  }
                  @for (tarea of tareasHoy().slice(0, 3); track tarea.id) {
                    <li class="item-compacto">
                      <span
                        class="punto-color"
                        [style.background-color]="tarea.vencida ? '#dc2626' : '#16a34a'"
                      ></span>
                      <span class="item-titulo">Tarea: {{ tarea.titulo }}</span>
                      <span class="item-hora">{{ tarea.porcentajeProgreso }}%</span>
                    </li>
                  }
                </ul>
              }
            </div>
          </div>

          <div class="bloque-detalle">
            <div class="bloque-cabecera">
              <div class="bloque-titulo">
                <lucide-icon [img]="iconoHoy" [size]="18" />
                <h3>Próximos eventos</h3>
              </div>
              <span class="badge-conteo">{{ proximosEventos().length }}</span>
            </div>

            @if (proximosEventos().length === 0) {
              <app-estado-vacio
                titulo="Sin eventos próximos"
                descripcion="No tienes eventos programados en los próximos 30 días."
              />
            } @else {
              <ul class="lista-proximos">
                @for (evento of proximosEventos(); track evento.id) {
                  <li class="item-proximo">
                    <div
                      class="barra-lateral-color"
                      [style.background-color]="evento.color || '#4f46e5'"
                    ></div>
                    <div class="proximo-info">
                      <div class="proximo-fila-superior">
                        <strong class="proximo-titulo">{{ evento.titulo }}</strong>
                        <span class="badge-tipo">{{ obtenerEtiquetaTipo(evento.tipo) }}</span>
                      </div>
                      <div class="proximo-meta">
                        <span>
                          <lucide-icon [img]="iconoReloj" [size]="13" />
                          {{ formatearFechaEvento(evento) }}
                        </span>
                        @if (evento.ubicacion) {
                          <span>
                            <lucide-icon [img]="iconoUbicacion" [size]="13" />
                            {{ evento.ubicacion }}
                          </span>
                        }
                      </div>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      }
    </section>
  `,
  styles: `
    .panel-estadisticas {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .cabecera-panel {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .titulo-bloque {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .icono-titulo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radio-pequeno);
      background-color: var(--color-primario-suave);
      color: var(--color-primario);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .titulo-panel {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-texto);
    }

    .subtitulo-panel {
      margin: 0.125rem 0 0;
      font-size: 0.875rem;
      color: var(--color-texto-secundario);
    }

    .controles-panel {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }

    .selector-mes {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background-color: var(--color-superficie-secundaria);
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-pequeno);
      padding: 0.25rem 0.375rem;
    }

    .etiqueta-mes {
      min-width: 8.5rem;
      text-align: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-texto);
      text-transform: capitalize;
    }

    .boton-icono {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border: 0;
      border-radius: 0.375rem;
      background: transparent;
      color: var(--color-texto-secundario);
      cursor: pointer;
      transition: background-color var(--transicion-base), color var(--transicion-base);
    }

    .boton-icono:hover {
      background-color: var(--color-superficie);
      color: var(--color-texto);
    }

    .boton-refrescar {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.45rem 0.75rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie);
      color: var(--color-texto);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transicion-base);
    }

    .boton-refrescar:hover:not(:disabled) {
      background-color: var(--color-superficie-secundaria);
    }

    .boton-refrescar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alerta-error {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radio-pequeno);
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: var(--color-peligro);
      font-size: 0.875rem;
    }

    .alerta-izquierda {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .boton-reintentar {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid #fca5a5;
      background-color: #ffffff;
      color: var(--color-peligro);
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
    }

    .rejilla-metricas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
      gap: 0.875rem;
    }

    .tarjeta-metrica {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 1rem;
      border-radius: var(--radio-pequeno);
      background-color: var(--color-superficie-secundaria);
      border: 1px solid var(--color-borde);
    }

    .metrica-vencidas-alerta {
      background-color: #fef2f2;
      border-color: #fecaca;
    }

    .metrica-vencidas-alerta .metrica-valor,
    .metrica-vencidas-alerta .metrica-icono {
      color: var(--color-peligro);
    }

    .metrica-cabecera {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .metrica-etiqueta {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-texto-secundario);
    }

    .metrica-icono {
      color: var(--color-primario);
    }

    .metrica-completadas .metrica-icono {
      color: var(--color-exito);
    }

    .metrica-pendientes .metrica-icono {
      color: var(--color-advertencia);
    }

    .metrica-valor {
      font-size: 1.625rem;
      font-weight: 700;
      line-height: 1.2;
      color: var(--color-texto);
    }

    .metrica-detalle {
      font-size: 0.75rem;
      color: var(--color-texto-secundario);
    }

    .rejilla-detalle {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 1rem;
    }

    .bloque-detalle {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-pequeno);
      background-color: var(--color-superficie);
    }

    .bloque-cabecera {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .bloque-titulo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-texto);
    }

    .bloque-titulo h3 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .selector-periodo {
      padding: 0.35rem 0.625rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie);
      color: var(--color-texto);
      font-size: 0.8125rem;
    }

    .progreso-contenedor {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .progreso-cifras {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .progreso-porcentaje {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primario);
    }

    .progreso-texto {
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
    }

    .barra-progreso {
      width: 100%;
      height: 0.625rem;
      border-radius: 999px;
      background-color: var(--color-superficie-secundaria);
      overflow: hidden;
    }

    .barra-progreso-relleno {
      height: 100%;
      border-radius: 999px;
      background-color: var(--color-primario);
      transition: width 250ms ease;
    }

    .resumen-hoy-lista {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-borde);
    }

    .subtitulo-bloque {
      margin: 0;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-texto-secundario);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .texto-vacio-compacto {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-texto-secundario);
    }

    .lista-compacta {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .item-compacto {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .punto-color {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .item-titulo {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--color-texto);
    }

    .item-hora {
      font-size: 0.75rem;
      color: var(--color-texto-secundario);
      flex-shrink: 0;
    }

    .badge-conteo {
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      background-color: var(--color-primario-suave);
      color: var(--color-primario);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .lista-proximos {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .item-proximo {
      display: flex;
      align-items: stretch;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: var(--radio-pequeno);
      background-color: var(--color-superficie-secundaria);
    }

    .barra-lateral-color {
      width: 0.25rem;
      border-radius: 999px;
      flex-shrink: 0;
    }

    .proximo-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .proximo-fila-superior {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .proximo-titulo {
      font-size: 0.875rem;
      color: var(--color-texto);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .badge-tipo {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.125rem 0.45rem;
      border-radius: 999px;
      background-color: var(--color-superficie);
      border: 1px solid var(--color-borde);
      color: var(--color-texto-secundario);
      flex-shrink: 0;
    }

    .proximo-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: var(--color-texto-secundario);
    }

    .proximo-meta span {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
  `,
})
export class PanelEstadisticasComponent implements OnInit {
  private readonly eventoService = inject(EventoService);
  private readonly tareaService = inject(TareaService);

  readonly actualizarTrigger = input<number>(0);

  protected readonly iconoEstadisticas = BarChart3;
  protected readonly iconoCalendario = Calendar;
  protected readonly iconoHoy = CalendarClock;
  protected readonly iconoTareas = ListTodo;
  protected readonly iconoCompletada = CheckCircle2;
  protected readonly iconoVencida = AlertTriangle;
  protected readonly iconoAlerta = AlertCircle;
  protected readonly iconoRecargar = RefreshCw;
  protected readonly iconoAnterior = ChevronLeft;
  protected readonly iconoSiguiente = ChevronRight;
  protected readonly iconoReloj = Clock;
  protected readonly iconoUbicacion = MapPin;
  protected readonly iconoTendencia = TrendingUp;

  protected readonly cargando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly eventosMes = signal<Evento[]>([]);
  protected readonly eventosProximosCache = signal<Evento[]>([]);
  protected readonly tareas = signal<Tarea[]>([]);
  protected readonly fechaMes = signal<Date>(this.obtenerInicioMes(new Date()));
  protected readonly periodoSeleccionado = signal<PeriodoTareas>('MES');

  constructor() {
    effect(() => {
      const trigger = this.actualizarTrigger();
      if (trigger > 0) {
        this.cargarEstadisticas();
      }
    });
  }

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  protected readonly etiquetaHoy = computed(() =>
    new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  );

  protected readonly etiquetaMesSeleccionado = computed(() =>
    this.fechaMes().toLocaleDateString('es-PE', {
      month: 'long',
      year: 'numeric',
    })
  );

  protected readonly eventosHoy = computed(() => {
    const hoyStr = this.formatearFechaIsoLocal(new Date());
    const unicos = new Map<string, Evento>();
    for (const ev of [...this.eventosMes(), ...this.eventosProximosCache()]) {
      const inicio = ev.fechaInicio.substring(0, 10);
      const fin = ev.fechaFin.substring(0, 10);
      if (hoyStr >= inicio && hoyStr <= fin) {
        unicos.set(ev.id, ev);
      }
    }
    return Array.from(unicos.values()).sort((a, b) =>
      a.fechaInicio.localeCompare(b.fechaInicio)
    );
  });

  protected readonly tareasHoy = computed(() => {
    const hoyStr = this.formatearFechaIsoLocal(new Date());
    return this.tareas().filter(
      (t) => t.fechaLimite && t.fechaLimite.substring(0, 10) === hoyStr
    );
  });

  protected readonly totalElementosHoy = computed(
    () => this.eventosHoy().length + this.tareasHoy().length
  );

  protected readonly tareasPendientes = computed(
    () => this.tareas().filter((t) => t.estado === 'PENDIENTE').length
  );

  protected readonly tareasEnProgreso = computed(
    () => this.tareas().filter((t) => t.estado === 'EN_PROGRESO').length
  );

  protected readonly tareasCompletadas = computed(
    () => this.tareas().filter((t) => t.estado === 'COMPLETADA').length
  );

  protected readonly tareasVencidas = computed(
    () => this.tareas().filter((t) => t.vencida && t.estado !== 'COMPLETADA').length
  );

  protected readonly proximosEventos = computed(() => {
    const ahora = Date.now();
    return this.eventosProximosCache()
      .filter((ev) => new Date(ev.fechaInicio).getTime() >= ahora)
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
      .slice(0, 5);
  });

  protected readonly resumenPeriodo = computed(() => {
    const periodo = this.periodoSeleccionado();
    const todas = this.tareas();

    if (periodo === 'TODO') {
      const completadas = todas.filter((t) => t.estado === 'COMPLETADA').length;
      return { total: todas.length, completadas };
    }

    let inicio: Date;
    let fin: Date;

    if (periodo === 'SEMANA') {
      fin = new Date();
      fin.setHours(23, 59, 59, 999);
      inicio = new Date();
      inicio.setDate(inicio.getDate() - 6);
      inicio.setHours(0, 0, 0, 0);
    } else {
      const base = this.fechaMes();
      inicio = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
      fin = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const filtradas = todas.filter((t) => {
      const fechaRef = t.fechaLimite ?? t.fechaCreacion;
      const ms = new Date(fechaRef).getTime();
      return ms >= inicio.getTime() && ms <= fin.getTime();
    });

    const completadas = filtradas.filter((t) => t.estado === 'COMPLETADA').length;
    return { total: filtradas.length, completadas };
  });

  protected readonly porcentajeCompletadoPeriodo = computed(() => {
    const { total, completadas } = this.resumenPeriodo();
    if (total === 0) return 0;
    return Math.round((completadas / total) * 100);
  });

  protected cambiarMes(delta: number): void {
    const actual = this.fechaMes();
    const nuevoMes = new Date(actual.getFullYear(), actual.getMonth() + delta, 1);
    this.fechaMes.set(nuevoMes);
    this.cargarEstadisticas();
  }

  protected cargarEstadisticas(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    const base = this.fechaMes();
    const inicioMes = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
    const finMes = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);

    const ahora = new Date();
    const en30Dias = new Date(ahora);
    en30Dias.setDate(en30Dias.getDate() + 30);

    let primerError: unknown = null;

    forkJoin({
      eventosMes: this.eventoService
        .obtenerEventosCalendario(inicioMes.toISOString(), finMes.toISOString())
        .pipe(
          catchError((err) => {
            primerError ??= err;
            return of([] as Evento[]);
          })
        ),
      proximos: this.eventoService
        .obtenerEventosCalendario(ahora.toISOString(), en30Dias.toISOString())
        .pipe(
          catchError((err) => {
            primerError ??= err;
            return of([] as Evento[]);
          })
        ),
      tareas: this.tareaService.listarTareas().pipe(
        catchError((err) => {
          primerError ??= err;
          return of([] as Tarea[]);
        })
      ),
    }).subscribe(({ eventosMes, proximos, tareas }) => {
      this.eventosMes.set(eventosMes);
      this.eventosProximosCache.set(proximos);
      this.tareas.set(tareas);

      if (primerError) {
        const errorApi = extraerErrorApi(
          primerError,
          'No se pudieron cargar todas las estadísticas. Intenta nuevamente.'
        );
        this.errorMensaje.set(errorApi.mensaje);
      }

      this.cargando.set(false);
    });
  }

  protected obtenerEtiquetaTipo(tipo: TipoEvento): string {
    return ETIQUETAS_TIPO[tipo];
  }

  protected formatearHora(fechaIso: string): string {
    return new Date(fechaIso).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected formatearFechaEvento(evento: Evento): string {
    const inicio = new Date(evento.fechaInicio);
    const fecha = inicio.toLocaleDateString('es-PE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return evento.diaCompleto ? `${fecha} · Todo el día` : `${fecha} · ${this.formatearHora(evento.fechaInicio)}`;
  }

  private obtenerInicioMes(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  }

  private formatearFechaIsoLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
