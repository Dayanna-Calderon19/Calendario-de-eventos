import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  Edit2,
  LucideAngularModule,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-angular';
import { Categoria, Evento, TipoEvento } from '../../core/models';
import { CategoriaService, EventoService, FiltrosEvento } from '../../core/services';
import { CargandoComponent } from '../../shared/components/cargando.component';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { extraerErrorApi } from '../../shared/utils/error-api.util';
import { DetalleEventoModalComponent } from '../calendario/components/detalle-evento-modal.component';
import { FormularioEventoModalComponent } from '../calendario/components/formulario-evento-modal.component';

type FiltroTipoOpcional = TipoEvento | '';

const ETIQUETAS_TIPO: Record<TipoEvento, string> = {
  EVENTO: 'Evento',
  CITA: 'Cita',
  FECHA_IMPORTANTE: 'Fecha importante',
};

@Component({
  selector: 'app-eventos-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CargandoComponent,
    EstadoVacioComponent,
    FormularioEventoModalComponent,
    DetalleEventoModalComponent,
  ],
  template: `
    <section class="pagina-eventos">
      <!-- Cabecera -->
      <header class="cabecera-seccion">
        <div>
          <h1 class="titulo-pagina">Eventos</h1>
          <p class="subtitulo-pagina">Administra tus eventos, citas y fechas importantes.</p>
        </div>
        <button type="button" class="boton boton-primario" (click)="abrirNuevoEvento()">
          <lucide-icon [img]="iconoNuevo" [size]="16" />
          <span>Nuevo evento</span>
        </button>
      </header>

      <!-- Barra de búsqueda y filtros -->
      <div class="tarjeta barra-filtros">
        <!-- Búsqueda por texto -->
        <div class="grupo-busqueda">
          <lucide-icon [img]="iconoBuscar" [size]="16" class="icono-busqueda" />
          <input
            type="search"
            class="campo-busqueda"
            placeholder="Buscar por título o descripción..."
            [ngModel]="filtroBusqueda()"
            (ngModelChange)="cambiarFiltroBusqueda($event)"
          />
          @if (filtroBusqueda()) {
            <button type="button" class="boton-limpiar-busqueda" (click)="cambiarFiltroBusqueda('')">
              <lucide-icon [img]="iconoX" [size]="14" />
            </button>
          }
        </div>

        <!-- Filtros secundarios -->
        <div class="fila-filtros-secundarios">
          <div class="grupo-filtro">
            <label for="filtroTipoEvento">Tipo</label>
            <select
              id="filtroTipoEvento"
              class="campo-entrada"
              [ngModel]="filtroTipo()"
              (ngModelChange)="cambiarFiltroTipo($event)"
            >
              <option value="">Todos los tipos</option>
              <option value="EVENTO">Evento</option>
              <option value="CITA">Cita</option>
              <option value="FECHA_IMPORTANTE">Fecha importante</option>
            </select>
          </div>

          <div class="grupo-filtro">
            <label for="filtroCategoriaEvento">Categoría</label>
            <select
              id="filtroCategoriaEvento"
              class="campo-entrada"
              [ngModel]="filtroCategoria()"
              (ngModelChange)="cambiarFiltroCategoria($event)"
            >
              <option value="">Todas las categorías</option>
              @for (cat of categorias(); track cat.id) {
                <option [value]="cat.id">{{ cat.nombre }}</option>
              }
            </select>
          </div>

          <div class="grupo-filtro">
            <label for="filtroDesdeEvento">Desde</label>
            <input
              id="filtroDesdeEvento"
              type="date"
              class="campo-entrada"
              [ngModel]="filtroDesde()"
              (ngModelChange)="cambiarFiltroDesde($event)"
            />
          </div>

          <div class="grupo-filtro">
            <label for="filtroHastaEvento">Hasta</label>
            <input
              id="filtroHastaEvento"
              type="date"
              class="campo-entrada"
              [ngModel]="filtroHasta()"
              (ngModelChange)="cambiarFiltroHasta($event)"
            />
          </div>

          @if (filtrosActivos() > 0) {
            <button type="button" class="boton-limpiar-filtros" (click)="limpiarFiltros()">
              <lucide-icon [img]="iconoX" [size]="14" />
              Limpiar filtros
              <span class="insignia-filtros">{{ filtrosActivos() }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Error -->
      @if (errorMensaje()) {
        <div class="alerta-error" role="alert">
          <div class="alerta-izquierda">
            <lucide-icon [img]="iconoAlerta" [size]="18" class="icono-alerta" />
            <span>{{ errorMensaje() }}</span>
          </div>
          <button type="button" class="boton-reintentar" (click)="cargarEventos()">
            <lucide-icon [img]="iconoRecargar" [size]="14" />
            <span>Reintentar</span>
          </button>
        </div>
      }

      <!-- Éxito temporal -->
      @if (mensajeExito()) {
        <div class="alerta-exito" role="status">
          <lucide-icon [img]="iconoCalendario" [size]="18" class="icono-exito" />
          <span>{{ mensajeExito() }}</span>
        </div>
      }

      <!-- Loading -->
      @if (cargando()) {
        <app-cargando />
      } @else if (eventos().length === 0) {
        <app-estado-vacio
          [titulo]="filtrosActivos() > 0 ? 'Sin resultados' : 'Sin eventos registrados'"
          [descripcion]="filtrosActivos() > 0
            ? 'Ningún evento coincide con los filtros aplicados. Intenta con otros criterios.'
            : 'Crea un nuevo evento con el botón de arriba o desde el calendario.'"
        />
      } @else {
        <!-- Contador -->
        <p class="contador-resultados">
          {{ totalEventos() }} {{ totalEventos() === 1 ? 'evento' : 'eventos' }}
          @if (filtrosActivos() > 0) { <span>· filtros activos</span> }
        </p>

        <!-- Lista de eventos -->
        <ul class="lista-eventos" role="list">
          @for (evento of eventos(); track evento.id) {
            <li class="tarjeta tarjeta-evento" role="listitem">
              <!-- Indicador de color -->
              <div
                class="indicador-color"
                [style.background-color]="evento.color || '#4F46E5'"
                aria-hidden="true"
              ></div>

              <div class="cuerpo-evento" (click)="abrirDetalle(evento)" role="button" tabindex="0"
                (keydown.enter)="abrirDetalle(evento)">
                <!-- Cabecera de la tarjeta -->
                <div class="cabecera-tarjeta-evento">
                  <div class="grupo-titulo">
                    <span class="etiqueta-tipo etiqueta-tipo-{{ evento.tipo.toLowerCase() }}">
                      {{ obtenerEtiquetaTipo(evento.tipo) }}
                    </span>
                    <h3 class="titulo-evento">{{ evento.titulo }}</h3>
                  </div>

                  <!-- Acciones -->
                  <div class="acciones-evento" (click)="$event.stopPropagation()">
                    <button
                      type="button"
                      class="boton-accion"
                      title="Editar evento"
                      (click)="abrirEdicion(evento)"
                    >
                      <lucide-icon [img]="iconoEditar" [size]="15" />
                    </button>
                    <button
                      type="button"
                      class="boton-accion boton-accion-peligro"
                      title="Eliminar evento"
                      (click)="confirmarEliminar(evento)"
                    >
                      <lucide-icon [img]="iconoEliminar" [size]="15" />
                    </button>
                  </div>
                </div>

                <!-- Fecha -->
                <div class="meta-evento">
                  <lucide-icon [img]="iconoCalDias" [size]="14" class="meta-icono" />
                  <span>
                    @if (evento.diaCompleto) {
                      {{ formatearFechaDia(evento.fechaInicio) }}
                      @if (evento.fechaFin !== evento.fechaInicio) {
                        — {{ formatearFechaDia(evento.fechaFin) }}
                      }
                      · Todo el día
                    } @else {
                      {{ formatearFecha(evento.fechaInicio) }}
                      @if (evento.fechaFin) { — {{ formatearFecha(evento.fechaFin) }} }
                    }
                  </span>
                </div>

                <!-- Ubicación -->
                @if (evento.ubicacion) {
                  <div class="meta-evento">
                    <lucide-icon [img]="iconoUbicacion" [size]="14" class="meta-icono" />
                    <span>{{ evento.ubicacion }}</span>
                  </div>
                }

                <!-- Categoría -->
                @if (evento.categoriaId) {
                  <div class="meta-evento">
                    <lucide-icon [img]="iconoEtiqueta" [size]="14" class="meta-icono" />
                    <span>{{ obtenerNombreCategoria(evento.categoriaId) }}</span>
                  </div>
                }

                <!-- Descripción snippet -->
                @if (evento.descripcion) {
                  <p class="descripcion-evento">{{ evento.descripcion }}</p>
                }
              </div>
            </li>
          }
        </ul>
      }

      <!-- Confirmación de eliminación -->
      @if (eventoAEliminar()) {
        <div class="fondo-modal" role="dialog" aria-modal="true" (click)="cancelarEliminar()">
          <div class="contenido-modal tarjeta dialogo-confirmacion" (click)="$event.stopPropagation()">
            <lucide-icon [img]="iconoCalX" [size]="32" class="icono-confirmacion" />
            <h3>¿Eliminar este evento?</h3>
            <p>Esta acción no se puede deshacer. El evento <strong>{{ eventoAEliminar()!.titulo }}</strong> se eliminará permanentemente.</p>
            <div class="acciones-confirmacion">
              <button type="button" class="boton boton-secundario" (click)="cancelarEliminar()">
                Cancelar
              </button>
              <button
                type="button"
                class="boton boton-peligro"
                [disabled]="eliminando()"
                (click)="ejecutarEliminar()"
              >
                {{ eliminando() ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal detalle -->
      @if (eventoDetalle()) {
        <app-detalle-evento-modal
          [evento]="eventoDetalle()!"
          (cerrar)="eventoDetalle.set(null)"
          (editar)="abrirEdicion($event)"
        />
      }

      <!-- Modal formulario -->
      @if (formularioAbierto()) {
        <app-formulario-evento-modal
          [eventoEditar]="eventoEnEdicion()"
          (cerrar)="cerrarFormulario()"
          (guardado)="alGuardarEvento($event)"
        />
      }
    </section>
  `,
  styles: `
    .pagina-eventos {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .cabecera-seccion {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .titulo-pagina { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .subtitulo-pagina { margin: 0.25rem 0 0; font-size: 0.875rem; color: var(--color-texto-secundario); }

    .boton {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background 0.15s, opacity 0.15s;
    }
    .boton-primario { background: var(--color-primario); color: #fff; }
    .boton-primario:hover { opacity: 0.9; }
    .boton-secundario { background: transparent; border-color: var(--color-borde); color: var(--color-texto-primario); }
    .boton-secundario:hover { background: var(--color-fondo-hover); }
    .boton-peligro { background: var(--color-peligro, #dc2626); color: #fff; }
    .boton-peligro:hover { opacity: 0.9; }
    .boton-peligro:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Tarjeta base */
    .tarjeta {
      background: var(--color-fondo-tarjeta);
      border: 1px solid var(--color-borde);
      border-radius: 0.75rem;
      padding: 1.25rem;
    }

    /* Filtros */
    .barra-filtros {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .grupo-busqueda {
      position: relative;
      display: flex;
      align-items: center;
    }
    .icono-busqueda {
      position: absolute;
      left: 0.75rem;
      color: var(--color-texto-secundario);
      pointer-events: none;
    }
    .campo-busqueda {
      width: 100%;
      padding: 0.5rem 2.25rem 0.5rem 2.5rem;
      border: 1px solid var(--color-borde);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: var(--color-fondo-entrada);
      color: var(--color-texto-primario);
      outline: none;
      transition: border-color 0.15s;
    }
    .campo-busqueda:focus { border-color: var(--color-primario); }

    .boton-limpiar-busqueda {
      position: absolute;
      right: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-texto-secundario);
      padding: 0.25rem;
      border-radius: 50%;
      transition: background 0.15s;
    }
    .boton-limpiar-busqueda:hover { background: var(--color-fondo-hover); }

    .fila-filtros-secundarios {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 0.75rem;
    }

    .grupo-filtro {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 150px;
    }
    .grupo-filtro label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-texto-secundario);
    }
    .campo-entrada {
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--color-borde);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: var(--color-fondo-entrada);
      color: var(--color-texto-primario);
      outline: none;
      transition: border-color 0.15s;
    }
    .campo-entrada:focus { border-color: var(--color-primario); }

    .boton-limpiar-filtros {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--color-peligro, #dc2626);
      background: none;
      border: 1px solid var(--color-borde-peligro, #fecaca);
      border-radius: 0.5rem;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      transition: background 0.15s;
      align-self: flex-end;
    }
    .boton-limpiar-filtros:hover { background: var(--color-fondo-peligro, #fef2f2); }

    .insignia-filtros {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      background: var(--color-peligro, #dc2626);
      color: #fff;
      font-size: 0.6875rem;
      font-weight: 600;
    }

    /* Alertas */
    .alerta-error {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: var(--color-fondo-peligro, #fef2f2);
      border: 1px solid var(--color-borde-peligro, #fecaca);
      border-radius: 0.5rem;
      color: var(--color-peligro, #dc2626);
      font-size: 0.875rem;
    }
    .alerta-izquierda { display: flex; align-items: center; gap: 0.5rem; }
    .icono-alerta { flex-shrink: 0; }

    .boton-reintentar {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--color-peligro, #dc2626);
      background: none;
      border: 1px solid currentColor;
      border-radius: 0.375rem;
      padding: 0.25rem 0.625rem;
      cursor: pointer;
      white-space: nowrap;
    }

    .alerta-exito {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: var(--color-fondo-exito, #f0fdf4);
      border: 1px solid var(--color-borde-exito, #bbf7d0);
      border-radius: 0.5rem;
      color: var(--color-exito, #16a34a);
      font-size: 0.875rem;
    }
    .icono-exito { flex-shrink: 0; }

    /* Contador */
    .contador-resultados {
      font-size: 0.875rem;
      color: var(--color-texto-secundario);
      margin: 0;
    }
    .contador-resultados span { color: var(--color-primario); font-weight: 500; }

    /* Lista de eventos */
    .lista-eventos {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .tarjeta-evento {
      display: flex;
      padding: 0;
      overflow: hidden;
      transition: box-shadow 0.15s, transform 0.15s;
      cursor: default;
    }
    .tarjeta-evento:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

    .indicador-color {
      width: 4px;
      flex-shrink: 0;
    }

    .cuerpo-evento {
      flex: 1;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      cursor: pointer;
    }

    .cabecera-tarjeta-evento {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .grupo-titulo {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    }

    .titulo-evento {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-texto-primario);
    }

    .etiqueta-tipo {
      display: inline-block;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      width: fit-content;
    }
    .etiqueta-tipo-evento { background: #ede9fe; color: #7c3aed; }
    .etiqueta-tipo-cita { background: #dbeafe; color: #2563eb; }
    .etiqueta-tipo-fecha_importante { background: #fef3c7; color: #d97706; }

    .meta-evento {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
    }
    .meta-icono { flex-shrink: 0; }

    .descripcion-evento {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Acciones en tarjeta */
    .acciones-evento {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .boton-accion {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      background: none;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      color: var(--color-texto-secundario);
      transition: background 0.15s, color 0.15s;
    }
    .boton-accion:hover { background: var(--color-fondo-hover); color: var(--color-texto-primario); }
    .boton-accion-peligro:hover { background: var(--color-fondo-peligro, #fef2f2); color: var(--color-peligro, #dc2626); }

    /* Modal confirmación */
    .fondo-modal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 1rem;
    }

    .contenido-modal {
      width: 100%;
      max-width: 440px;
    }

    .dialogo-confirmacion {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;
    }

    .icono-confirmacion {
      color: var(--color-peligro, #dc2626);
    }

    .dialogo-confirmacion h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .dialogo-confirmacion p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-texto-secundario);
    }

    .acciones-confirmacion {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      width: 100%;
    }
  `,
})
export class EventosPageComponent implements OnInit {
  private readonly eventoService = inject(EventoService);
  private readonly categoriaService = inject(CategoriaService);

  protected readonly iconoNuevo = Plus;
  protected readonly iconoBuscar = Search;
  protected readonly iconoX = X;
  protected readonly iconoAlerta = AlertCircle;
  protected readonly iconoRecargar = RefreshCw;
  protected readonly iconoCalendario = CalendarCheck;
  protected readonly iconoCalDias = CalendarDays;
  protected readonly iconoCalX = CalendarX;
  protected readonly iconoUbicacion = MapPin;
  protected readonly iconoEtiqueta = Tag;
  protected readonly iconoEditar = Edit2;
  protected readonly iconoEliminar = Trash2;

  protected readonly cargando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected readonly eventos = signal<Evento[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);

  protected readonly filtroBusqueda = signal('');
  protected readonly filtroTipo = signal<FiltroTipoOpcional>('');
  protected readonly filtroCategoria = signal('');
  protected readonly filtroDesde = signal('');
  protected readonly filtroHasta = signal('');

  protected readonly eventoDetalle = signal<Evento | null>(null);
  protected readonly formularioAbierto = signal(false);
  protected readonly eventoEnEdicion = signal<Evento | null>(null);
  protected readonly eventoAEliminar = signal<Evento | null>(null);

  protected readonly totalEventos = computed(() => this.eventos().length);

  protected readonly filtrosActivos = computed(() => {
    let count = 0;
    if (this.filtroBusqueda()) count++;
    if (this.filtroTipo()) count++;
    if (this.filtroCategoria()) count++;
    if (this.filtroDesde()) count++;
    if (this.filtroHasta()) count++;
    return count;
  });

  private categoriaMap = new Map<string, string>();

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarEventos();
  }

  protected cargarCategorias(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (lista) => {
        this.categorias.set(lista);
        this.categoriaMap = new Map(lista.map((c) => [c.id, c.nombre]));
      },
      error: () => { /* categorías opcionales */ },
    });
  }

  protected cargarEventos(): void {
    if (this.filtroDesde() && this.filtroHasta() && this.filtroHasta() < this.filtroDesde()) {
      this.errorMensaje.set('La fecha "Hasta" debe ser igual o posterior a la fecha "Desde".');
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    const filtros: FiltrosEvento = {
      busqueda: this.filtroBusqueda() || undefined,
      tipo: (this.filtroTipo() as TipoEvento) || undefined,
      categoriaId: this.filtroCategoria() || undefined,
      desde: this.filtroDesde() ? new Date(`${this.filtroDesde()}T00:00:00`).toISOString() : undefined,
      hasta: this.filtroHasta() ? new Date(`${this.filtroHasta()}T23:59:59`).toISOString() : undefined,
    };

    this.eventoService.listarEventos(filtros).subscribe({
      next: (lista) => {
        this.eventos.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        const errorApi = extraerErrorApi(err, 'No se pudieron cargar los eventos.');
        this.errorMensaje.set(errorApi.mensaje);
      },
    });
  }

  protected cambiarFiltroBusqueda(valor: string): void {
    this.filtroBusqueda.set(valor);
    this.cargarEventos();
  }

  protected cambiarFiltroTipo(tipo: FiltroTipoOpcional): void {
    this.filtroTipo.set(tipo);
    this.cargarEventos();
  }

  protected cambiarFiltroCategoria(id: string): void {
    this.filtroCategoria.set(id);
    this.cargarEventos();
  }

  protected cambiarFiltroDesde(fecha: string): void {
    this.filtroDesde.set(fecha);
    this.cargarEventos();
  }

  protected cambiarFiltroHasta(fecha: string): void {
    this.filtroHasta.set(fecha);
    this.cargarEventos();
  }

  protected limpiarFiltros(): void {
    this.filtroBusqueda.set('');
    this.filtroTipo.set('');
    this.filtroCategoria.set('');
    this.filtroDesde.set('');
    this.filtroHasta.set('');
    this.cargarEventos();
  }

  protected abrirNuevoEvento(): void {
    this.eventoEnEdicion.set(null);
    this.formularioAbierto.set(true);
  }

  protected abrirDetalle(evento: Evento): void {
    this.eventoDetalle.set(evento);
  }

  protected abrirEdicion(evento: Evento): void {
    this.eventoDetalle.set(null);
    this.eventoEnEdicion.set(evento);
    this.formularioAbierto.set(true);
  }

  protected cerrarFormulario(): void {
    this.formularioAbierto.set(false);
    this.eventoEnEdicion.set(null);
  }

  protected alGuardarEvento(evento: Evento): void {
    const fueEdicion = Boolean(this.eventoEnEdicion());
    this.cerrarFormulario();
    this.mostrarExitoTemporal(
      fueEdicion ? 'Evento actualizado correctamente.' : 'Evento creado correctamente.'
    );
    this.cargarEventos();
  }

  protected confirmarEliminar(evento: Evento): void {
    this.eventoAEliminar.set(evento);
  }

  protected cancelarEliminar(): void {
    this.eventoAEliminar.set(null);
  }

  protected ejecutarEliminar(): void {
    const evento = this.eventoAEliminar();
    if (!evento) return;
    this.eliminando.set(true);
    this.eventoService.eliminarEvento(evento.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.eventoAEliminar.set(null);
        this.mostrarExitoTemporal('Evento eliminado correctamente.');
        this.cargarEventos();
      },
      error: (err) => {
        this.eliminando.set(false);
        this.eventoAEliminar.set(null);
        const errorApi = extraerErrorApi(err, 'No se pudo eliminar el evento.');
        this.errorMensaje.set(errorApi.mensaje);
      },
    });
  }

  protected obtenerEtiquetaTipo(tipo: TipoEvento): string {
    return ETIQUETAS_TIPO[tipo];
  }

  protected obtenerNombreCategoria(categoriaId: string): string {
    return this.categoriaMap.get(categoriaId) ?? 'Categoría';
  }

  protected formatearFecha(fechaIso: string): string {
    return new Date(fechaIso).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected formatearFechaDia(fechaIso: string): string {
    return new Date(fechaIso).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private mostrarExitoTemporal(mensaje: string): void {
    this.mensajeExito.set(mensaje);
    setTimeout(() => {
      if (this.mensajeExito() === mensaje) {
        this.mensajeExito.set(null);
      }
    }, 4000);
  }
}
