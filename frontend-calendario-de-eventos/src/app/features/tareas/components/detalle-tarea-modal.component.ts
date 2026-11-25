import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertCircle, AlertTriangle, Bell, Calendar, CheckCircle2, Edit3, Flag, LucideAngularModule, Plus, Trash2, X } from 'lucide-angular';
import { Recordatorio, Tarea } from '../../../core/models';
import { RecordatorioService } from '../../../core/services';

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
  selector: 'app-detalle-tarea-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div
      class="fondo-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-detalle-tarea"
      (click)="cerrar.emit()"
      (keydown.escape)="cerrar.emit()"
    >
      <div class="contenido-modal tarjeta" (click)="$event.stopPropagation()">
        <header class="cabecera-modal">
          <div class="titulo-grupo">
            <h2 id="titulo-detalle-tarea" class="titulo-modal">{{ tarea().titulo }}</h2>
            @if (tarea().vencida) {
              <span class="etiqueta-vencida">
                <lucide-icon [img]="iconoVencida" [size]="13" />
                <span>Vencida</span>
              </span>
            }
          </div>
          <button
            type="button"
            class="boton-cerrar"
            (click)="cerrar.emit()"
            aria-label="Cerrar detalle de la tarea"
          >
            <lucide-icon [img]="iconoCerrar" [size]="18" />
          </button>
        </header>

        <div class="cuerpo-modal">
          <div class="fila-meta">
            <lucide-icon [img]="iconoPrioridad" [size]="16" />
            <span>Prioridad: <strong>{{ obtenerEtiquetaPrioridad(tarea().prioridad) }}</strong></span>
          </div>

          <div class="fila-meta">
            <lucide-icon [img]="iconoEstado" [size]="16" />
            <span>Estado: <strong>{{ obtenerEtiquetaEstado(tarea().estado) }}</strong></span>
          </div>

          @if (tarea().fechaLimite) {
            <div class="fila-meta">
              <lucide-icon [img]="iconoCalendario" [size]="16" />
              <span>Fecha límite: {{ formatearFechaHora(tarea().fechaLimite!) }}</span>
            </div>
          }

          <div class="bloque-progreso">
            <div class="progreso-cabecera">
              <span>Progreso</span>
              <strong>{{ tarea().porcentajeProgreso }}%</strong>
            </div>
            <div class="barra-fondo">
              <div
                class="barra-relleno"
                [style.width.%]="tarea().porcentajeProgreso"
                [class.completada]="tarea().estado === 'COMPLETADA'"
              ></div>
            </div>
          </div>

          @if (tarea().descripcion) {
            <p class="descripcion-tarea">{{ tarea().descripcion }}</p>
          }

          <!-- Sección recordatorios (solo si tiene fecha límite y no está completada) -->
          @if (tarea().fechaLimite && tarea().estado !== 'COMPLETADA') {
            <div class="seccion-recordatorios">
              <div class="recordatorios-cabecera">
                <lucide-icon [img]="iconoRecordatorio" [size]="15" />
                <span class="recordatorios-titulo">Recordatorios</span>
              </div>

              @if (errorRecordatorio()) {
                <p class="error-recordatorio" role="alert">{{ errorRecordatorio() }}</p>
              }

              @if (cargandoRecordatorios()) {
                <p class="cargando-recordatorios">Cargando…</p>
              } @else {
                @if (recordatorios().length > 0) {
                  <ul class="lista-recordatorios">
                    @for (rec of recordatorios(); track rec.id) {
                      <li class="item-recordatorio">
                        <lucide-icon [img]="iconoRecordatorio" [size]="13" />
                        <span>{{ etiquetaMinutos(rec.minutosAnticipacion) }} antes</span>
                        <button
                          type="button"
                          class="boton-eliminar-recordatorio"
                          (click)="eliminarRecordatorio(rec.id)"
                          title="Eliminar recordatorio"
                        >
                          <lucide-icon [img]="iconoEliminar" [size]="13" />
                        </button>
                      </li>
                    }
                  </ul>
                }

                @if (!mostrarFormRecordatorio()) {
                  <button
                    type="button"
                    class="boton-agregar-recordatorio"
                    (click)="mostrarFormRecordatorio.set(true)"
                  >
                    <lucide-icon [img]="iconoAgregar" [size]="13" />
                    <span>Agregar recordatorio</span>
                  </button>
                } @else {
                  <div class="form-recordatorio">
                    <div class="opciones-anticipacion">
                      @for (op of opcionesAnticipacion; track op.minutos) {
                        <button
                          type="button"
                          class="chip-anticipacion"
                          [class.seleccionado]="minutosSeleccionados() === op.minutos"
                          (click)="minutosSeleccionados.set(op.minutos)"
                        >
                          {{ op.etiqueta }}
                        </button>
                      }
                    </div>
                    @if (minutosSeleccionados() === -1) {
                      <input
                        type="number"
                        class="input-minutos"
                        [(ngModel)]="minutosPersonalizados"
                        min="1"
                        max="43200"
                        placeholder="Minutos de anticipación"
                      />
                    }
                    <div class="acciones-form-recordatorio">
                      <button type="button" class="boton-cancelar-rec" (click)="cancelarFormRecordatorio()">
                        Cancelar
                      </button>
                      <button
                        type="button"
                        class="boton-guardar-rec"
                        (click)="guardarRecordatorio()"
                        [disabled]="guardandoRecordatorio()"
                      >
                        {{ guardandoRecordatorio() ? 'Guardando…' : 'Guardar' }}
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          }
        </div>

        @if (confirmandoEliminacion()) {
          <div class="confirmacion-eliminar" role="alert">
            <span>¿Seguro que deseas eliminar esta tarea?</span>
            <div class="acciones-confirmacion">
              <button type="button" class="boton-secundario" (click)="confirmandoEliminacion.set(false)">
                Cancelar
              </button>
              <button type="button" class="boton-peligro" (click)="eliminar.emit(tarea())">
                Sí, eliminar
              </button>
            </div>
          </div>
        } @else {
          <footer class="acciones-modal">
            <button type="button" class="boton-secundario" (click)="editar.emit(tarea())">
              <lucide-icon [img]="iconoEditar" [size]="15" />
              <span>Editar</span>
            </button>
            <button type="button" class="boton-peligro-suave" (click)="confirmandoEliminacion.set(true)">
              <lucide-icon [img]="iconoEliminar" [size]="15" />
              <span>Eliminar</span>
            </button>
          </footer>
        }
      </div>
    </div>
  `,
  styles: `
    .fondo-modal {
      position: fixed;
      inset: 0;
      z-index: 1100;
      background-color: rgb(15 23 42 / 45%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .contenido-modal {
      width: 100%;
      max-width: 460px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: var(--sombra-panel);
    }
    .cabecera-modal {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .titulo-grupo {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
    .titulo-modal {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-texto);
    }
    .etiqueta-vencida {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #991b1b;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
    }
    .boton-cerrar {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-texto-secundario);
      padding: 0.25rem;
      border-radius: var(--radio-pequeno);
      display: inline-flex;
    }
    .boton-cerrar:hover {
      color: var(--color-texto);
      background-color: var(--color-superficie-secundaria);
    }
    .cuerpo-modal {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }
    .fila-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--color-texto-secundario);
    }
    .bloque-progreso {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      margin-top: 0.25rem;
    }
    .progreso-cabecera {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
    }
    .barra-fondo {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background-color: var(--color-superficie-secundaria);
      overflow: hidden;
    }
    .barra-relleno {
      height: 100%;
      background-color: var(--color-primario);
      transition: width var(--transicion-base);
    }
    .barra-relleno.completada {
      background-color: var(--color-exito);
    }
    .descripcion-tarea {
      margin-top: 0.375rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-borde);
      font-size: 0.875rem;
      color: var(--color-texto);
      white-space: pre-line;
    }
    .acciones-modal {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-borde);
    }
    .confirmacion-eliminar {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      padding: 0.75rem;
      border-radius: var(--radio-pequeno);
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      font-size: 0.875rem;
    }
    .acciones-confirmacion {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    .boton-secundario,
    .boton-peligro-suave,
    .boton-peligro {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.4375rem 0.75rem;
      border-radius: var(--radio-pequeno);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
    }
    .boton-secundario {
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto);
      border: 1px solid var(--color-borde);
    }
    .boton-peligro-suave {
      background-color: #fef2f2;
      color: var(--color-peligro);
      border: 1px solid #fecaca;
    }
    .boton-peligro {
      background-color: var(--color-peligro);
      color: #ffffff;
      border: 1px solid var(--color-peligro);
    }
    /* Recordatorios */
    .seccion-recordatorios {
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-borde);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .recordatorios-cabecera {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-texto-secundario);
    }
    .recordatorios-titulo { }
    .error-recordatorio {
      font-size: 0.8125rem;
      color: #991b1b;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radio-pequeno);
      padding: 0.375rem 0.625rem;
      margin: 0;
    }
    .cargando-recordatorios {
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
      margin: 0;
    }
    .lista-recordatorios {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .item-recordatorio {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
    }
    .boton-eliminar-recordatorio {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.375rem;
      height: 1.375rem;
      border-radius: var(--radio-pequeno);
      border: none;
      background: transparent;
      color: var(--color-texto-secundario);
      cursor: pointer;
    }
    .boton-eliminar-recordatorio:hover {
      background-color: #fef2f2;
      color: var(--color-peligro);
    }
    .boton-agregar-recordatorio {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.3125rem 0.625rem;
      border-radius: var(--radio-pequeno);
      border: 1px dashed var(--color-borde);
      background: transparent;
      color: var(--color-texto-secundario);
      font-size: 0.8125rem;
      cursor: pointer;
      transition: color var(--transicion-base), border-color var(--transicion-base);
    }
    .boton-agregar-recordatorio:hover {
      color: var(--color-primario);
      border-color: var(--color-primario);
    }
    .form-recordatorio {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .opciones-anticipacion {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }
    .chip-anticipacion {
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto-secundario);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color var(--transicion-base), color var(--transicion-base);
    }
    .chip-anticipacion.seleccionado {
      background-color: var(--color-primario);
      color: #fff;
      border-color: var(--color-primario);
    }
    .input-minutos {
      width: 100%;
      padding: 0.375rem 0.625rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie);
      color: var(--color-texto);
      font-size: 0.875rem;
    }
    .acciones-form-recordatorio {
      display: flex;
      justify-content: flex-end;
      gap: 0.375rem;
    }
    .boton-cancelar-rec {
      padding: 0.3125rem 0.625rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background: transparent;
      color: var(--color-texto-secundario);
      font-size: 0.8125rem;
      cursor: pointer;
    }
    .boton-guardar-rec {
      padding: 0.3125rem 0.75rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-primario);
      background-color: var(--color-primario);
      color: #fff;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
    }
    .boton-guardar-rec:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
})
export class DetalleTareaModalComponent implements OnInit {
  private readonly recordatorioService = inject(RecordatorioService);

  readonly tarea = input.required<Tarea>();

  readonly cerrar = output<void>();
  readonly editar = output<Tarea>();
  readonly eliminar = output<Tarea>();

  protected readonly confirmandoEliminacion = signal(false);
  protected readonly recordatorios = signal<Recordatorio[]>([]);
  protected readonly cargandoRecordatorios = signal(false);
  protected readonly errorRecordatorio = signal('');
  protected readonly mostrarFormRecordatorio = signal(false);
  protected readonly minutosSeleccionados = signal(60);
  protected readonly guardandoRecordatorio = signal(false);
  protected minutosPersonalizados = 60;

  protected readonly opcionesAnticipacion = [
    { minutos: 10, etiqueta: '10 min' },
    { minutos: 30, etiqueta: '30 min' },
    { minutos: 60, etiqueta: '1 hora' },
    { minutos: 240, etiqueta: '4 horas' },
    { minutos: 1440, etiqueta: '1 día' },
    { minutos: 2880, etiqueta: '2 días' },
    { minutos: -1, etiqueta: 'Personalizado' },
  ];

  protected readonly iconoCerrar = X;
  protected readonly iconoPrioridad = Flag;
  protected readonly iconoEstado = CheckCircle2;
  protected readonly iconoCalendario = Calendar;
  protected readonly iconoVencida = AlertTriangle;
  protected readonly iconoEditar = Edit3;
  protected readonly iconoEliminar = Trash2;
  protected readonly iconoRecordatorio = Bell;
  protected readonly iconoAgregar = Plus;
  protected readonly iconoError = AlertCircle;

  ngOnInit(): void {
    if (this.tarea().fechaLimite && this.tarea().estado !== 'COMPLETADA') {
      this.cargarRecordatorios();
    }
  }

  private cargarRecordatorios(): void {
    this.cargandoRecordatorios.set(true);
    this.recordatorioService.listarRecordatorios(undefined, this.tarea().id).subscribe({
      next: (lista) => {
        this.recordatorios.set(lista);
        this.cargandoRecordatorios.set(false);
      },
      error: () => {
        this.errorRecordatorio.set('No se pudieron cargar los recordatorios.');
        this.cargandoRecordatorios.set(false);
      },
    });
  }

  protected cancelarFormRecordatorio(): void {
    this.mostrarFormRecordatorio.set(false);
    this.minutosSeleccionados.set(60);
    this.errorRecordatorio.set('');
  }

  protected guardarRecordatorio(): void {
    const minutos = this.minutosSeleccionados() === -1
      ? this.minutosPersonalizados
      : this.minutosSeleccionados();

    if (!minutos || minutos < 1 || minutos > 43200) {
      this.errorRecordatorio.set('La anticipación debe estar entre 1 y 43 200 minutos (30 días).');
      return;
    }

    this.guardandoRecordatorio.set(true);
    this.errorRecordatorio.set('');
    this.recordatorioService.crearRecordatorio({
      tareaId: this.tarea().id,
      minutosAnticipacion: minutos,
    }).subscribe({
      next: (nuevo) => {
        this.recordatorios.update(lista => [...lista, nuevo]);
        this.mostrarFormRecordatorio.set(false);
        this.minutosSeleccionados.set(60);
        this.guardandoRecordatorio.set(false);
      },
      error: (err) => {
        const msg = err?.error?.mensaje ?? 'No se pudo guardar el recordatorio. Inténtalo nuevamente.';
        this.errorRecordatorio.set(msg);
        this.guardandoRecordatorio.set(false);
      },
    });
  }

  protected eliminarRecordatorio(id: string): void {
    this.recordatorioService.eliminarRecordatorio(id).subscribe({
      next: () => this.recordatorios.update(lista => lista.filter(r => r.id !== id)),
      error: () => this.errorRecordatorio.set('No se pudo eliminar el recordatorio.'),
    });
  }

  protected esSoloLectura(): boolean {
    return !!(this.tarea().vencida && this.tarea().estado !== 'COMPLETADA');
  }

  protected obtenerEtiquetaPrioridad(prioridad: string): string {
    return ETIQUETAS_PRIORIDAD[prioridad] ?? prioridad;
  }

  protected obtenerEtiquetaEstado(estado: string): string {
    return ETIQUETAS_ESTADO[estado] ?? estado;
  }

  protected formatearFechaHora(fechaIso: string): string {
    return new Date(fechaIso).toLocaleString('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  protected etiquetaMinutos(minutos: number): string {
    if (minutos < 60) return `${minutos} min`;
    if (minutos < 1440) return `${minutos / 60} h`;
    return `${minutos / 1440} día${minutos / 1440 > 1 ? 's' : ''}`;
  }
}
