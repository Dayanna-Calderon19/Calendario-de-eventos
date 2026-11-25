import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Eye,
  LucideAngularModule,
  Plus,
  RefreshCw,
  Search,
  Tag,
  X,
} from 'lucide-angular';
import { Categoria, EstadoTarea, PrioridadTarea, Tarea } from '../../core/models';
import { CategoriaService, FiltrosTarea, TareaService } from '../../core/services';
import { CargandoComponent } from '../../shared/components/cargando.component';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { extraerErrorApi } from '../../shared/utils/error-api.util';
import { DetalleTareaModalComponent } from './components/detalle-tarea-modal.component';
import { FormularioTareaModalComponent } from './components/formulario-tarea-modal.component';

const ETIQUETAS_PRIORIDAD: Record<PrioridadTarea, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

@Component({
  selector: 'app-tareas-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CargandoComponent,
    EstadoVacioComponent,
    FormularioTareaModalComponent,
    DetalleTareaModalComponent,
  ],
  template: `
    <section class="pagina-tareas">
      <header class="cabecera-seccion">
        <div>
          <h1 class="titulo-pagina">Tareas</h1>
          <p class="subtitulo-pagina">Controla prioridades, estados, fechas límite y progreso.</p>
        </div>
        <button type="button" class="boton boton-primario" (click)="abrirNuevaTarea()">
          <lucide-icon [img]="iconoNuevo" [size]="16" />
          <span>Nueva tarea</span>
        </button>
      </header>

      <div class="resumen-contadores">
        <button
          type="button"
          class="tarjeta-contador contador-interactivo"
          [class.contador-activo]="filtroEstado() === 'PENDIENTE'"
          (click)="alternarFiltroRapidoEstado('PENDIENTE')"
        >
          <div class="contador-top">
            <span class="contador-etiqueta">Pendientes</span>
            <lucide-icon [img]="iconoPendiente" [size]="16" class="contador-icono" />
          </div>
          <strong class="contador-valor">{{ totalPendientes() }}</strong>
        </button>

        <button
          type="button"
          class="tarjeta-contador contador-interactivo"
          [class.contador-activo]="filtroEstado() === 'EN_PROGRESO'"
          (click)="alternarFiltroRapidoEstado('EN_PROGRESO')"
        >
          <div class="contador-top">
            <span class="contador-etiqueta">En progreso</span>
            <lucide-icon [img]="iconoReloj" [size]="16" class="contador-icono texto-primario" />
          </div>
          <strong class="contador-valor">{{ totalEnProgreso() }}</strong>
        </button>

        <button
          type="button"
          class="tarjeta-contador contador-interactivo"
          [class.contador-activo]="filtroEstado() === 'COMPLETADA'"
          (click)="alternarFiltroRapidoEstado('COMPLETADA')"
        >
          <div class="contador-top">
            <span class="contador-etiqueta">Completadas</span>
            <lucide-icon [img]="iconoCompletada" [size]="16" class="contador-icono texto-exito" />
          </div>
          <strong class="contador-valor texto-exito">{{ totalCompletadas() }}</strong>
        </button>

        <div class="tarjeta-contador" [class.contador-alerta]="totalVencidas() > 0">
          <div class="contador-top">
            <span class="contador-etiqueta">Vencidas</span>
            <lucide-icon [img]="iconoVencida" [size]="16" class="contador-icono texto-peligro" />
          </div>
          <strong class="contador-valor texto-peligro">{{ totalVencidas() }}</strong>
        </div>
      </div>

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
            <label for="filtroEstado">Estado</label>
            <select
              id="filtroEstado"
              class="campo-entrada"
              [ngModel]="filtroEstado()"
              (ngModelChange)="cambiarFiltroEstado($event)"
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROGRESO">En progreso</option>
              <option value="COMPLETADA">Completada</option>
            </select>
          </div>

          <div class="grupo-filtro">
            <label for="filtroPrioridad">Prioridad</label>
            <select
              id="filtroPrioridad"
              class="campo-entrada"
              [ngModel]="filtroPrioridad()"
              (ngModelChange)="cambiarFiltroPrioridad($event)"
            >
              <option value="">Todas las prioridades</option>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>

          <div class="grupo-filtro">
            <label for="filtroCategoriaT">Categoría</label>
            <select
              id="filtroCategoriaT"
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
            <label for="filtroDesdeT">Desde</label>
            <input
              id="filtroDesdeT"
              type="date"
              class="campo-entrada"
              [ngModel]="filtroDesde()"
              (ngModelChange)="cambiarFiltroDesde($event)"
            />
          </div>

          <div class="grupo-filtro">
            <label for="filtroHastaT">Hasta</label>
            <input
              id="filtroHastaT"
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

      @if (errorMensaje()) {
        <div class="alerta-error" role="alert">
          <div class="alerta-izquierda">
            <lucide-icon [img]="iconoAlerta" [size]="18" class="icono-alerta" />
            <span>{{ errorMensaje() }}</span>
          </div>
          <button type="button" class="boton-reintentar" (click)="cargarTareas()">
            <lucide-icon [img]="iconoRecargar" [size]="14" />
            <span>Reintentar</span>
          </button>
        </div>
      }

      @if (mensajeExito()) {
        <div class="alerta-exito" role="status">
          <lucide-icon [img]="iconoCompletada" [size]="18" class="icono-exito" />
          <span>{{ mensajeExito() }}</span>
        </div>
      }

      @if (cargando()) {
        <app-cargando mensaje="Cargando tus tareas..." />
      } @else if (tareas().length === 0) {
        <app-estado-vacio
          titulo="No hay tareas para mostrar"
          [descripcion]="
            filtrosActivos() > 0
              ? 'No se encontraron tareas con los filtros actuales.'
              : 'Crea tu primera tarea para organizar tus pendientes y prioridades.'
          "
        >
          @if (filtrosActivos() > 0) {
            <button type="button" class="boton boton-secundario" (click)="limpiarFiltros()">
              <lucide-icon [img]="iconoX" [size]="15" />
              <span>Limpiar filtros</span>
            </button>
          } @else {
            <button type="button" class="boton boton-primario" (click)="abrirNuevaTarea()">
              <lucide-icon [img]="iconoNuevo" [size]="15" />
              <span>Crear tarea</span>
            </button>
          }
        </app-estado-vacio>
      } @else {
        <ul class="lista-tareas" role="list">
          @for (tarea of tareas(); track tarea.id) {
            <li
              class="tarjeta item-tarea"
              [class.tarea-vencida]="tarea.vencida"
              [class.tarea-completada]="tarea.estado === 'COMPLETADA'"
            >
              <div class="fila-principal">
                <button
                  type="button"
                  class="boton-completar"
                  (click)="alternarCompletada(tarea)"
                  [title]="
                    tarea.estado === 'COMPLETADA'
                      ? 'Marcar como pendiente'
                      : 'Marcar como completada'
                  "
                  [attr.aria-label]="
                    tarea.estado === 'COMPLETADA'
                      ? 'Marcar como pendiente'
                      : 'Marcar como completada'
                  "
                >
                  <lucide-icon
                    [img]="tarea.estado === 'COMPLETADA' ? iconoCompletada : iconoPendiente"
                    [size]="20"
                  />
                </button>

                <div
                  class="info-tarea"
                  (click)="abrirDetalle(tarea)"
                  (keydown.enter)="abrirDetalle(tarea)"
                  tabindex="0"
                  role="button"
                >
                  <div class="titulo-linea">
                    <span class="titulo-tarea">{{ tarea.titulo }}</span>
                    <span class="etiqueta-prioridad" [attr.data-prioridad]="tarea.prioridad">
                      {{ obtenerEtiquetaPrioridad(tarea.prioridad) }}
                    </span>
                    @if (obtenerCategoria(tarea.categoriaId); as cat) {
                      <span class="etiqueta-categoria">
                        <span class="punto-categoria" [style.background-color]="cat.color"></span>
                        <span>{{ cat.nombre }}</span>
                      </span>
                    }
                    @if (tarea.vencida) {
                      <span class="etiqueta-vencida">
                        <lucide-icon [img]="iconoVencida" [size]="12" />
                        <span>Vencida</span>
                      </span>
                    }
                  </div>

                  @if (tarea.descripcion) {
                    <p class="descripcion-tarea">{{ tarea.descripcion }}</p>
                  }

                  <div class="meta-linea">
                    @if (tarea.fechaLimite) {
                      <span class="fecha-limite">
                        <lucide-icon [img]="iconoCalendario" [size]="13" />
                        <span>{{ formatearFecha(tarea.fechaLimite) }}</span>
                      </span>
                    }
                    <span class="avance-texto">Avance: {{ tarea.porcentajeProgreso }}%</span>
                  </div>

                  <div class="barra-fondo">
                    <div
                      class="barra-relleno"
                      [style.width.%]="tarea.porcentajeProgreso"
                      [class.completada]="tarea.estado === 'COMPLETADA'"
                    ></div>
                  </div>
                </div>

                <div class="acciones-tarea">
                  <select
                    class="selector-estado"
                    [ngModel]="tarea.estado"
                    (ngModelChange)="cambiarEstadoRapido(tarea, $event)"
                    aria-label="Cambiar estado de la tarea"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROGRESO">En progreso</option>
                    <option value="COMPLETADA">Completada</option>
                  </select>

                  <div class="botones-rapidos">
                    <button
                      type="button"
                      class="boton-accion-icono"
                      (click)="abrirDetalle(tarea)"
                      title="Ver detalle"
                      aria-label="Ver detalle de la tarea"
                    >
                      <lucide-icon [img]="iconoVer" [size]="16" />
                    </button>
                    <button
                      type="button"
                      class="boton-accion-icono"
                      (click)="abrirEdicion(tarea)"
                      title="Editar tarea"
                      aria-label="Editar tarea"
                    >
                      <lucide-icon [img]="iconoEditar" [size]="16" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          }
        </ul>
      }

      @if (tareaDetalle()) {
        <app-detalle-tarea-modal
          [tarea]="tareaDetalle()!"
          (cerrar)="tareaDetalle.set(null)"
          (editar)="abrirEdicion($event)"
          (eliminar)="eliminarTarea($event)"
        />
      }

      @if (formularioAbierto()) {
        <app-formulario-tarea-modal
          [tareaEditar]="tareaEnEdicion()"
          (cerrar)="cerrarFormulario()"
          (guardado)="alGuardarTarea()"
        />
      }
    </section>
  `,
  styles: `
    .pagina-tareas {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .cabecera-seccion {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .titulo-pagina {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-texto);
    }
    .subtitulo-pagina {
      margin: 0.25rem 0 0;
      color: var(--color-texto-secundario);
      font-size: 0.9375rem;
    }
    .resumen-contadores {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.875rem;
    }
    @media (min-width: 768px) {
      .resumen-contadores {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    .tarjeta-contador {
      background-color: var(--color-superficie);
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-base);
      padding: 0.875rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      text-align: left;
      transition: border-color var(--transicion-base), box-shadow var(--transicion-base),
        transform var(--transicion-base);
    }
    .contador-interactivo {
      cursor: pointer;
    }
    .contador-interactivo:hover {
      border-color: var(--color-primario);
      box-shadow: var(--sombra-suave);
      transform: translateY(-1px);
    }
    .contador-activo {
      border-color: var(--color-primario);
      background-color: var(--color-primario-suave);
    }
    .contador-alerta {
      background-color: #fef2f2;
      border-color: #fecaca;
    }
    .contador-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .contador-icono {
      color: var(--color-texto-secundario);
    }
    .contador-etiqueta {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-texto-secundario);
    }
    .contador-valor {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-texto);
    }
    .texto-primario { color: var(--color-primario); }
    .texto-exito { color: var(--color-exito); }
    .texto-peligro { color: var(--color-peligro); }
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
      padding: 0.625rem 2.25rem 0.625rem 2.25rem;
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-pequeno);
      background-color: var(--color-superficie);
      color: var(--color-texto);
      font-size: 0.9rem;
      transition: border-color var(--transicion-base);
    }
    .campo-busqueda:focus {
      outline: none;
      border-color: var(--color-primario);
    }
    .boton-limpiar-busqueda {
      position: absolute;
      right: 0.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border: 0;
      background: transparent;
      color: var(--color-texto-secundario);
      border-radius: 50%;
      cursor: pointer;
    }
    .boton-limpiar-busqueda:hover {
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto);
    }
    .fila-filtros-secundarios {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      align-items: end;
      gap: 0.75rem;
    }
    .grupo-filtro {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .grupo-filtro label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-texto-secundario);
    }
    .boton-limpiar-filtros {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      height: 2.5rem;
      padding: 0 0.75rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color var(--transicion-base);
    }
    .boton-limpiar-filtros:hover {
      background-color: var(--color-borde);
    }
    .insignia-filtros {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 0.35rem;
      border-radius: 999px;
      background-color: var(--color-primario);
      color: #ffffff;
      font-size: 0.75rem;
    }
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
    .icono-alerta { color: var(--color-peligro); }
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
    .icono-exito { color: var(--color-exito); }
    .lista-tareas {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .item-tarea {
      padding: 1rem 1.125rem;
      border-left: 4px solid var(--color-primario);
      transition: box-shadow var(--transicion-base), transform var(--transicion-base);
    }
    .item-tarea:hover {
      box-shadow: var(--sombra-panel);
      transform: translateY(-1px);
    }
    .item-tarea.tarea-vencida {
      border-left-color: var(--color-peligro);
    }
    .item-tarea.tarea-completada {
      border-left-color: var(--color-exito);
      opacity: 0.85;
    }
    .fila-principal {
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
      flex-wrap: wrap;
    }
    .boton-completar {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-texto-secundario);
      padding: 0.125rem;
      margin-top: 0.125rem;
    }
    .tarea-completada .boton-completar {
      color: var(--color-exito);
    }
    .info-tarea {
      flex: 1;
      min-width: 220px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      cursor: pointer;
    }
    .titulo-linea {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
    .titulo-tarea {
      font-weight: 600;
      color: var(--color-texto);
    }
    .tarea-completada .titulo-tarea {
      text-decoration: line-through;
      color: var(--color-texto-secundario);
    }
    .etiqueta-prioridad {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto-secundario);
    }
    .etiqueta-prioridad[data-prioridad='ALTA'] {
      background-color: #fef3c7;
      color: #92400e;
    }
    .etiqueta-prioridad[data-prioridad='URGENTE'] {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .etiqueta-categoria {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto);
    }
    .punto-categoria {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
    }
    .descripcion-tarea {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-texto-secundario);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
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
    .meta-linea {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
    }
    .fecha-limite {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    .barra-fondo {
      width: 100%;
      height: 6px;
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
    .acciones-tarea {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    .botones-rapidos {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    .boton-accion-icono {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie);
      color: var(--color-texto-secundario);
      cursor: pointer;
      transition: background-color var(--transicion-base), color var(--transicion-base);
    }
    .boton-accion-icono:hover {
      background-color: var(--color-superficie-secundaria);
      color: var(--color-primario);
    }
    .selector-estado {
      padding: 0.375rem 0.625rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie);
      color: var(--color-texto);
      font-size: 0.8125rem;
    }
    .boton-secundario {
      background-color: var(--color-superficie);
      border: 1px solid var(--color-borde);
      color: var(--color-texto);
    }
    .boton-secundario:hover {
      background-color: var(--color-superficie-secundaria);
    }
    .boton {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radio-pequeno);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
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
export class TareasPageComponent implements OnInit {
  
  private readonly categoriaService = inject(CategoriaService);
  private readonly tareaService = inject(TareaService);

  // Icons
  protected readonly iconoBuscar = Search;
  protected readonly iconoX = X;

  // UI state signals
  protected readonly cargando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);
  protected readonly tareas = signal<Tarea[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);

  // Filter signals
  protected readonly iconoNuevo = Plus;
  protected readonly iconoAlerta = AlertCircle;
  protected readonly iconoRecargar = RefreshCw;
  protected readonly iconoCompletada = CheckCircle2;
  protected readonly iconoPendiente = Circle;
  protected readonly iconoVencida = AlertTriangle;
  protected readonly iconoCalendario = Calendar;
  protected readonly iconoReloj = Clock;
  protected readonly iconoVer = Eye;
  protected readonly iconoEditar = Edit2;

  protected readonly filtroBusqueda = signal<string>('');
  protected readonly filtroEstado = signal<EstadoTarea | ''>('');
  protected readonly filtroPrioridad = signal<PrioridadTarea | ''>('');
  protected readonly filtroCategoria = signal<string>('');
  protected readonly filtroDesde = signal<string>('');
  protected readonly filtroHasta = signal<string>('');

  // Computed: count active filters
  protected readonly filtrosActivos = computed(() => {
    let count = 0;
    if (this.filtroBusqueda()) count++;
    if (this.filtroEstado()) count++;
    if (this.filtroPrioridad()) count++;
    if (this.filtroCategoria()) count++;
    if (this.filtroDesde()) count++;
    if (this.filtroHasta()) count++;
    return count;
  });

  // Totals for counters
  protected readonly totalPendientes = computed(() => this.tareas().filter(t => t.estado === 'PENDIENTE').length);
  protected readonly totalEnProgreso = computed(() => this.tareas().filter(t => t.estado === 'EN_PROGRESO').length);
  protected readonly totalCompletadas = computed(() => this.tareas().filter(t => t.estado === 'COMPLETADA').length);
  protected readonly totalVencidas = computed(() => this.tareas().filter(t => t.vencida).length);

  // Modal controls
  protected readonly tareaDetalle = signal<Tarea | null>(null);
  protected readonly formularioAbierto = signal(false);
  protected readonly tareaEnEdicion = signal<Tarea | null>(null);

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarTareas();
  }

  // Load categories for filter dropdown
  private cargarCategorias(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: cats => this.categorias.set(cats),
      error: err => {
        const api = extraerErrorApi(err, 'No se pudieron cargar las categorías.');
        this.errorMensaje.set(api.mensaje);
      }
    });
  }

  // Load tasks with current filters
  protected cargarTareas(): void {
    if (this.filtroDesde() && this.filtroHasta() && this.filtroHasta() < this.filtroDesde()) {
      this.errorMensaje.set('La fecha "Hasta" debe ser igual o posterior a la fecha "Desde".');
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);
    const filtros = {
      busqueda: this.filtroBusqueda() || undefined,
      estado: this.filtroEstado() || undefined,
      prioridad: this.filtroPrioridad() || undefined,
      categoriaId: this.filtroCategoria() || undefined,
      desde: this.filtroDesde() ? new Date(`${this.filtroDesde()}T00:00:00`).toISOString() : undefined,
      hasta: this.filtroHasta() ? new Date(`${this.filtroHasta()}T23:59:59`).toISOString() : undefined,
    } as FiltrosTarea;
    this.tareaService.listarTareas(filtros).subscribe({
      next: lista => {
        this.tareas.set(lista);
        this.cargando.set(false);
      },
      error: err => {
        this.cargando.set(false);
        const api = extraerErrorApi(err, 'No se pudieron cargar las tareas.');
        this.errorMensaje.set(api.mensaje);
      }
    });
  }

  // Filter change handlers
  protected cambiarFiltroBusqueda(valor: string): void { this.filtroBusqueda.set(valor); this.cargarTareas(); }
  protected cambiarFiltroEstado(estado: EstadoTarea | ''): void { this.filtroEstado.set(estado); this.cargarTareas(); }
  protected cambiarFiltroPrioridad(prioridad: PrioridadTarea | ''): void { this.filtroPrioridad.set(prioridad); this.cargarTareas(); }
  protected cambiarFiltroCategoria(catId: string): void { this.filtroCategoria.set(catId); this.cargarTareas(); }
  protected cambiarFiltroDesde(fecha: string): void { this.filtroDesde.set(fecha); this.cargarTareas(); }
  protected cambiarFiltroHasta(fecha: string): void { this.filtroHasta.set(fecha); this.cargarTareas(); }

  protected limpiarFiltros(): void {
    this.filtroBusqueda.set('');
    this.filtroEstado.set('');
    this.filtroPrioridad.set('');
    this.filtroCategoria.set('');
    this.filtroDesde.set('');
    this.filtroHasta.set('');
    this.cargarTareas();
  }

  // Existing methods (adjusted to use new signals where needed)
  protected abrirNuevaTarea(): void { this.tareaEnEdicion.set(null); this.formularioAbierto.set(true); }
  protected abrirDetalle(tarea: Tarea): void { this.tareaDetalle.set(tarea); }
  protected abrirEdicion(tarea: Tarea): void { this.tareaDetalle.set(null); this.tareaEnEdicion.set(tarea); this.formularioAbierto.set(true); }
  protected cerrarFormulario(): void { this.formularioAbierto.set(false); this.tareaEnEdicion.set(null); }
  protected alGuardarTarea(): void {
    const fueEdicion = Boolean(this.tareaEnEdicion());
    this.cerrarFormulario();
    this.mostrarExitoTemporal(fueEdicion ? 'Tarea actualizada correctamente.' : 'Tarea creada correctamente.');
    this.cargarCategorias();
    this.cargarTareas();
  }
  protected alternarCompletada(tarea: Tarea): void {
    const nuevoEstado: EstadoTarea = tarea.estado === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA';
    this.cambiarEstadoRapido(tarea, nuevoEstado);
  }
  protected cambiarEstadoRapido(tarea: Tarea, estado: EstadoTarea): void {
    this.errorMensaje.set(null);
    this.tareaService.cambiarEstado(tarea.id, {
      estado,
      porcentajeProgreso: estado === 'COMPLETADA' ? 100 : estado === 'PENDIENTE' ? 0 : tarea.porcentajeProgreso,
    }).subscribe({
      next: actualizada => {
        this.tareas.update(lista => lista.map(t => t.id === actualizada.id ? actualizada : t));
        this.mostrarExitoTemporal('Estado de la tarea actualizado.');
      },
      error: err => {
        const api = extraerErrorApi(err, 'No se pudo actualizar el estado de la tarea.');
        this.errorMensaje.set(api.mensaje);
      }
    });
  }
  protected eliminarTarea(tarea: Tarea): void {
    this.tareaService.eliminarTarea(tarea.id).subscribe({
      next: () => {
        this.tareaDetalle.set(null);
        this.mostrarExitoTemporal('Tarea eliminada correctamente.');
        this.cargarTareas();
      },
      error: err => {
        this.tareaDetalle.set(null);
        const api = extraerErrorApi(err, 'No se pudo eliminar la tarea.');
        this.errorMensaje.set(api.mensaje);
      }
    });
  }
  protected obtenerEtiquetaPrioridad(prioridad: PrioridadTarea): string { return ETIQUETAS_PRIORIDAD[prioridad]; }
  protected obtenerCategoria(categoriaId?: string): Categoria | undefined {
    if (!categoriaId) return undefined;
    return this.categorias().find((c) => c.id === categoriaId);
  }
  protected alternarFiltroRapidoEstado(estado: EstadoTarea): void {
    this.filtroEstado.set(this.filtroEstado() === estado ? '' : estado);
    this.cargarTareas();
  }
  protected formatearFecha(fechaIso: string): string {
    return new Date(fechaIso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
  }
  private mostrarExitoTemporal(mensaje: string): void {
    this.mensajeExito.set(mensaje);
    setTimeout(() => { if (this.mensajeExito() === mensaje) this.mensajeExito.set(null); }, 4000);
  }
}
