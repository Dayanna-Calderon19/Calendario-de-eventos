import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertCircle, LucideAngularModule, Plus, X } from 'lucide-angular';
import { Categoria, EstadoTarea, PrioridadTarea, Tarea } from '../../../core/models';
import { CategoriaService, TareaService } from '../../../core/services';
import { BotonComponent } from '../../../shared/components/boton.component';
import { extraerErrorApi } from '../../../shared/utils/error-api.util';

@Component({
  selector: 'app-formulario-tarea-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule, BotonComponent],
  template: `
    <div
      class="fondo-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-tarea"
      (click)="cerrar.emit()"
      (keydown.escape)="cerrar.emit()"
    >
      <div class="contenido-modal tarjeta" (click)="$event.stopPropagation()">
        <header class="cabecera-modal">
          <h2 id="titulo-modal-tarea" class="titulo-modal">
            {{ tareaEditar() ? 'Editar tarea' : 'Nueva tarea' }}
          </h2>
          <button
            type="button"
            class="boton-cerrar"
            (click)="cerrar.emit()"
            aria-label="Cerrar formulario de tarea"
          >
            <lucide-icon [img]="iconoCerrar" [size]="18" />
          </button>
        </header>

        @if (errorMensaje()) {
          <div class="alerta-error" role="alert">
            <lucide-icon [img]="iconoAlerta" [size]="18" class="icono-alerta" />
            <div class="alerta-contenido">
              <strong>{{ errorMensaje() }}</strong>
              @if (listaErroresDetalle().length > 0) {
                <ul class="lista-errores-detalle">
                  @for (detalle of listaErroresDetalle(); track detalle) {
                    <li>{{ detalle }}</li>
                  }
                </ul>
              }
            </div>
          </div>
        }

        <form [formGroup]="formulario" (ngSubmit)="guardar()" class="formulario-tarea" novalidate>
          <div class="grupo-campo">
            <label for="tituloTarea">Título</label>
            <input
              id="tituloTarea"
              type="text"
              formControlName="titulo"
              class="campo-entrada"
              [class.campo-invalido]="mostrarErrorCampo('titulo')"
              placeholder="Ej. Entregar reporte mensual"
            />
            @if (obtenerErrorCampo('titulo')) {
              <span class="mensaje-error">{{ obtenerErrorCampo('titulo') }}</span>
            }
          </div>

          <div class="fila-doble">
            <div class="grupo-campo">
              <label for="prioridadTarea">Prioridad</label>
              <select id="prioridadTarea" formControlName="prioridad" class="campo-entrada">
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            <div class="grupo-campo">
              <label for="estadoTarea">Estado</label>
              <select
                id="estadoTarea"
                formControlName="estado"
                class="campo-entrada"
                (change)="alCambiarEstado()"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROGRESO">En progreso</option>
                <option value="COMPLETADA">Completada</option>
              </select>
            </div>
          </div>

          <div class="fila-doble">
            <div class="grupo-campo">
              <label for="progresoTarea">
                Progreso ({{ formulario.controls.porcentajeProgreso.value }}%)
              </label>
              <input
                id="progresoTarea"
                type="range"
                min="0"
                max="100"
                step="5"
                formControlName="porcentajeProgreso"
                class="control-rango"
              />
              @if (obtenerErrorCampo('porcentajeProgreso')) {
                <span class="mensaje-error">{{ obtenerErrorCampo('porcentajeProgreso') }}</span>
              }
            </div>

            <div class="grupo-campo">
              <label for="fechaLimiteTarea">Fecha límite (opcional)</label>
              <input
                id="fechaLimiteTarea"
                type="datetime-local"
                formControlName="fechaLimite"
                class="campo-entrada"
              />
            </div>
          </div>

          <!-- Categoría -->
          <div class="grupo-campo">
            <div class="etiqueta-con-accion">
              <label for="categoriaTarea">Categoría (opcional)</label>
              <button
                type="button"
                class="boton-nueva-categoria"
                (click)="toggleNuevaCategoria()"
              >
                <lucide-icon [img]="iconoNuevo" [size]="12" />
                {{ mostrarNuevaCategoria() ? 'Cancelar' : 'Nueva' }}
              </button>
            </div>
            <select id="categoriaTarea" formControlName="categoriaId" class="campo-entrada">
              <option value="">Sin categoría</option>
              @for (cat of categorias(); track cat.id) {
                <option [value]="cat.id">
                  {{ cat.nombre }}
                </option>
              }
            </select>
            @if (categoriaSeleccionada(); as catSel) {
              <div class="vista-previa-categoria">
                <span class="punto-color-categoria" [style.background-color]="catSel.color"></span>
                <span>Color asignado: <strong>{{ catSel.nombre }}</strong></span>
              </div>
            }

            @if (mostrarNuevaCategoria()) {
              <div class="caja-nueva-categoria">
                <input
                  type="text"
                  class="campo-entrada"
                  placeholder="Nombre de la categoría"
                  [(ngModel)]="nuevaCategoriaNombre"
                  [ngModelOptions]="{standalone: true}"
                  maxlength="80"
                />
                <div class="fila-color-boton">
                  <label class="etiqueta-color">
                    Color
                    <input type="color" [(ngModel)]="nuevaCategoriaColor" [ngModelOptions]="{standalone: true}" />
                  </label>
                  <button
                    type="button"
                    class="boton boton-secundario boton-crear-categoria"
                    [disabled]="creandoCategoria()"
                    (click)="crearCategoriaRapida()"
                  >
                    {{ creandoCategoria() ? 'Creando...' : 'Crear' }}
                  </button>
                </div>
                @if (errorCategoria()) {
                  <span class="mensaje-error">{{ errorCategoria() }}</span>
                }
              </div>
            }
          </div>

          <div class="grupo-campo">
            <label for="descripcionTarea">Descripción (opcional)</label>
            <textarea
              id="descripcionTarea"
              formControlName="descripcion"
              class="campo-entrada campo-textarea"
              [class.campo-invalido]="mostrarErrorCampo('descripcion')"
              placeholder="Detalles adicionales sobre la tarea..."
              rows="3"
            ></textarea>
            @if (obtenerErrorCampo('descripcion')) {
              <span class="mensaje-error">{{ obtenerErrorCampo('descripcion') }}</span>
            }
          </div>

          <div class="acciones-formulario">
            <app-boton variante="secundario" tipo="button" (click)="cerrar.emit()">
              Cancelar
            </app-boton>
            <app-boton variante="primario" tipo="submit" [cargando]="guardando()">
              {{ tareaEditar() ? 'Actualizar' : 'Crear tarea' }}
            </app-boton>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: `
    .fondo-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 1rem;
    }

    .contenido-modal {
      width: 100%;
      max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .cabecera-modal {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .titulo-modal {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-texto-primario);
      margin: 0;
    }

    .boton-cerrar {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-texto-secundario);
      display: flex;
      padding: 0.25rem;
      border-radius: 0.375rem;
      transition: background 0.15s;
    }
    .boton-cerrar:hover { background: var(--color-fondo-hover); }

    .formulario-tarea {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .grupo-campo {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .fila-doble {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-texto-primario);
    }

    .campo-textarea { resize: vertical; min-height: 80px; }

    .control-rango {
      width: 100%;
      accent-color: var(--color-primario);
    }

    .acciones-formulario {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--color-borde);
    }

    .alerta-error {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: var(--color-fondo-peligro, #fef2f2);
      border: 1px solid var(--color-borde-peligro, #fecaca);
      border-radius: 0.5rem;
      color: var(--color-peligro, #dc2626);
      font-size: 0.875rem;
    }
    .alerta-contenido { display: flex; flex-direction: column; gap: 0.375rem; }
    .icono-alerta { flex-shrink: 0; margin-top: 1px; }
    .lista-errores-detalle { margin: 0; padding-left: 1.25rem; }
    .mensaje-error { font-size: 0.75rem; color: var(--color-peligro, #dc2626); }

    .etiqueta-con-accion {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .boton-nueva-categoria {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-primario);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      transition: background 0.15s;
    }
    .boton-nueva-categoria:hover { background: var(--color-fondo-hover); }

    .caja-nueva-categoria {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--color-fondo-secundario);
      border-radius: 0.5rem;
      border: 1px solid var(--color-borde);
    }
    .fila-color-boton {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .etiqueta-color {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      cursor: pointer;
    }
    .etiqueta-color input[type="color"] {
      width: 2rem;
      height: 1.75rem;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
    }
    .boton-crear-categoria { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }
    .vista-previa-categoria {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.25rem;
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
    }
    .punto-color-categoria {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 9999px;
      flex-shrink: 0;
      border: 1px solid rgb(0 0 0 / 12%);
    }
  `,
})
export class FormularioTareaModalComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly tareaService = inject(TareaService);
  private readonly categoriaService = inject(CategoriaService);

  readonly tareaEditar = input<Tarea | null>(null);

  readonly cerrar = output<void>();
  readonly guardado = output<Tarea>();

  protected readonly iconoCerrar = X;
  protected readonly iconoAlerta = AlertCircle;
  protected readonly iconoNuevo = Plus;

  protected readonly guardando = signal(false);
  protected readonly intentoEnvio = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly mostrarNuevaCategoria = signal(false);
  protected readonly creandoCategoria = signal(false);
  protected readonly errorCategoria = signal<string | null>(null);

  protected nuevaCategoriaNombre = '';
  protected nuevaCategoriaColor = '#4F46E5';

  protected readonly formulario = this.formBuilder.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    prioridad: ['MEDIA' as PrioridadTarea, [Validators.required]],
    estado: ['PENDIENTE' as EstadoTarea, [Validators.required]],
    porcentajeProgreso: [0, [Validators.min(0), Validators.max(100)]],
    fechaLimite: [''],
    descripcion: ['', [Validators.maxLength(1000)]],
    categoriaId: [''],
  });

  protected readonly listaErroresDetalle = computed(() =>
    Object.values(this.erroresServidor())
  );

  ngOnInit(): void {
    this.cargarCategorias();
    const tarea = this.tareaEditar();
    if (tarea) {
      this.formulario.patchValue({
        titulo: tarea.titulo,
        prioridad: tarea.prioridad,
        estado: tarea.estado,
        porcentajeProgreso: tarea.porcentajeProgreso,
        fechaLimite: tarea.fechaLimite ? this.aDatetimeLocal(tarea.fechaLimite) : '',
        descripcion: tarea.descripcion ?? '',
        categoriaId: tarea.categoriaId ?? '',
      });
    }
    this.alCambiarEstado();
  }

  protected categoriaSeleccionada(): Categoria | undefined {
    const id = this.formulario.controls.categoriaId.value;
    if (!id) return undefined;
    return this.categorias().find((c) => c.id === id);
  }

  protected cargarCategorias(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (lista) => this.categorias.set(lista),
      error: () => { /* categorías opcionales — no bloquear el formulario */ },
    });
  }

  protected toggleNuevaCategoria(): void {
    this.mostrarNuevaCategoria.update((v) => !v);
    this.errorCategoria.set(null);
    this.nuevaCategoriaNombre = '';
  }

  protected crearCategoriaRapida(): void {
    const nombre = this.nuevaCategoriaNombre.trim();
    if (!nombre) {
      this.errorCategoria.set('El nombre de la categoría es obligatorio.');
      return;
    }
    this.creandoCategoria.set(true);
    this.errorCategoria.set(null);
    this.categoriaService.crearCategoria({ nombre, color: this.nuevaCategoriaColor }).subscribe({
      next: (nuevaCategoria) => {
        this.creandoCategoria.set(false);
        this.categorias.update((lista) => [...lista, nuevaCategoria]);
        this.formulario.controls.categoriaId.setValue(nuevaCategoria.id);
        this.mostrarNuevaCategoria.set(false);
        this.nuevaCategoriaNombre = '';
      },
      error: (err) => {
        this.creandoCategoria.set(false);
        const errorApi = extraerErrorApi(err, 'No se pudo crear la categoría.');
        this.errorCategoria.set(errorApi.mensaje);
      },
    });
  }

  protected alCambiarEstado(): void {
    const estado = this.formulario.controls.estado.value;
    const controlProgreso = this.formulario.controls.porcentajeProgreso;

    if (estado === 'COMPLETADA') {
      controlProgreso.setValue(100);
      controlProgreso.disable();
      return;
    }

    if (!this.tareaEditar() && estado === 'PENDIENTE') {
      controlProgreso.setValue(0);
      controlProgreso.disable();
      return;
    }

    controlProgreso.enable();
  }

  protected mostrarErrorCampo(nombreCampo: string): boolean {
    return this.obtenerErrorCampo(nombreCampo) !== null;
  }

  protected obtenerErrorCampo(nombreCampo: string): string | null {
    const errorServidor = this.erroresServidor()[nombreCampo];
    if (errorServidor) {
      return errorServidor;
    }

    const control = this.formulario.get(nombreCampo);
    if (!control || (!control.touched && !this.intentoEnvio()) || !control.errors) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    if (control.hasError('minlength')) {
      const requerido = control.getError('minlength').requiredLength;
      return `Debe tener al menos ${requerido} caracteres.`;
    }
    if (control.hasError('maxlength')) {
      const maximo = control.getError('maxlength').requiredLength;
      return `No debe superar los ${maximo} caracteres.`;
    }
    return null;
  }

  protected guardar(): void {
    this.intentoEnvio.set(true);
    this.formulario.markAllAsTouched();
    this.errorMensaje.set(null);
    this.erroresServidor.set({});

    if (this.formulario.invalid || this.guardando()) {
      this.errorMensaje.set('Completa los campos obligatorios antes de guardar.');
      return;
    }

    const valores = this.formulario.getRawValue();
    const fechaLimiteIso = valores.fechaLimite
      ? new Date(valores.fechaLimite).toISOString()
      : undefined;

    if (!this.tareaEditar() && fechaLimiteIso && new Date(fechaLimiteIso) < new Date()) {
      this.errorMensaje.set('La fecha límite de una nueva tarea debe ser igual o posterior al momento actual.');
      this.erroresServidor.set({
        fechaLimite: 'Selecciona una fecha y hora igual o posterior a la actual.',
      });
      return;
    }

    const solicitud = {
      titulo: valores.titulo.trim(),
      prioridad: valores.prioridad,
      estado: valores.estado,
      porcentajeProgreso: valores.porcentajeProgreso,
      fechaLimite: fechaLimiteIso,
      descripcion: valores.descripcion.trim() || undefined,
      categoriaId: valores.categoriaId || undefined,
    };

    this.guardando.set(true);
    const tareaActual = this.tareaEditar();
    const peticion = tareaActual
      ? this.tareaService.actualizarTarea(tareaActual.id, solicitud)
      : this.tareaService.crearTarea(solicitud);

    peticion.subscribe({
      next: (tareaGuardada) => {
        this.guardando.set(false);
        this.guardado.emit(tareaGuardada);
      },
      error: (err) => {
        this.guardando.set(false);
        const errorApi = extraerErrorApi(err, 'No se pudo guardar la tarea.');
        this.errorMensaje.set(errorApi.mensaje);
        this.erroresServidor.set(errorApi.detalles);
      },
    });
  }

  private aDatetimeLocal(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
  }
}
