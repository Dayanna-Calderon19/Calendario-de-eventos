import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertCircle, LucideAngularModule, Plus, X } from 'lucide-angular';
import { Categoria, Evento, TipoEvento } from '../../../core/models';
import { CategoriaService, EventoService } from '../../../core/services';
import { BotonComponent } from '../../../shared/components/boton.component';
import { extraerErrorApi } from '../../../shared/utils/error-api.util';

const COLORES_POR_TIPO: Record<TipoEvento, string> = {
  EVENTO: '#4f46e5',
  CITA: '#0891b2',
  FECHA_IMPORTANTE: '#d97706',
};

@Component({
  selector: 'app-formulario-evento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, BotonComponent],
  template: `
    <div
      class="fondo-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-evento"
      (click)="cerrar.emit()"
      (keydown.escape)="cerrar.emit()"
    >
      <div class="contenido-modal tarjeta" (click)="$event.stopPropagation()">
        <header class="cabecera-modal">
          <h2 id="titulo-modal-evento" class="titulo-modal">
            {{ eventoEditar() ? 'Editar evento' : 'Nuevo evento' }}
          </h2>
          <button
            type="button"
            class="boton-cerrar"
            (click)="cerrar.emit()"
            aria-label="Cerrar formulario de evento"
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

                @if (esEventoPasado()) {
          <div class="alerta-error" role="alert">
            <lucide-icon [img]="iconoAlerta" [size]="18" class="icono-alerta" />
            <strong>Este evento ya ocurrió y no se puede editar ni reprogramar.</strong>
          </div>
        }

        <form [formGroup]="formulario" (ngSubmit)="guardar()" class="formulario-evento" novalidate>
          <div class="grupo-campo">
            <label for="tituloEvento">Título</label>
            <input
              id="tituloEvento"
              type="text"
              formControlName="titulo"
              class="campo-entrada"
              [class.campo-invalido]="mostrarErrorCampo('titulo')"
              placeholder="Ej. Reunión de equipo"
              [disabled]="esEventoPasado()"
            />
            @if (obtenerErrorCampo('titulo')) {
              <span class="mensaje-error">{{ obtenerErrorCampo('titulo') }}</span>
            }
          </div>

          <div class="fila-doble">
            <div class="grupo-campo">
              <label for="tipoEvento">Tipo</label>
              <select
                id="tipoEvento"
                formControlName="tipo"
                class="campo-entrada"
                (change)="alCambiarTipo()"
                [disabled]="esEventoPasado()"
              >
                <option value="EVENTO">Evento</option>
                <option value="CITA">Cita</option>
                <option value="FECHA_IMPORTANTE">Fecha importante</option>
              </select>
            </div>

            <div class="grupo-campo">
              <label for="colorEvento">Color</label>
              <input id="colorEvento" type="color" formControlName="color" class="campo-color" [disabled]="esEventoPasado()" />
            </div>
          </div>

          <label class="casilla-dia-completo">
            <input type="checkbox" formControlName="diaCompleto" [disabled]="esEventoPasado()" />
            <span>Evento de día completo</span>
          </label>

          <div class="fila-doble">
            <div class="grupo-campo">
              <label for="fechaInicioEvento">
                {{ formulario.controls.diaCompleto.value ? 'Fecha de inicio' : 'Inicio' }}
              </label>
              <input
                id="fechaInicioEvento"
                [type]="formulario.controls.diaCompleto.value ? 'date' : 'datetime-local'"
                formControlName="inicio"
                class="campo-entrada"
                [class.campo-invalido]="mostrarErrorCampo('inicio')"
                [attr.min]="formulario.controls.diaCompleto.value ? fechaActualISO().substring(0, 10) : fechaActualISO()"
                [disabled]="esEventoPasado()"
              />
              @if (obtenerErrorCampo('inicio')) {
                <span class="mensaje-error">{{ obtenerErrorCampo('inicio') }}</span>
              }
            </div>

            <div class="grupo-campo">
              <label for="fechaFinEvento">
                {{ formulario.controls.diaCompleto.value ? 'Fecha de fin' : 'Finalización' }}
              </label>
              <input
                id="fechaFinEvento"
                [type]="formulario.controls.diaCompleto.value ? 'date' : 'datetime-local'"
                formControlName="fin"
                class="campo-entrada"
                [class.campo-invalido]="mostrarErrorCampo('fin')"
                [attr.min]="formulario.controls.diaCompleto.value ? fechaActualISO().substring(0, 10) : fechaActualISO()"
                [disabled]="esEventoPasado()"
              />
              @if (obtenerErrorCampo('fin')) {
                <span class="mensaje-error">{{ obtenerErrorCampo('fin') }}</span>
              }
            </div>
          </div>

          <div class="fila-doble">
            <div class="grupo-campo">
              <label for="ubicacionEvento">Ubicación (opcional)</label>
              <input
                id="ubicacionEvento"
                type="text"
                formControlName="ubicacion"
                class="campo-entrada"
                placeholder="Ej. Sala 2 o enlace virtual"
                [disabled]="esEventoPasado()"
              />
            </div>

            <div class="grupo-campo">
              <div class="etiqueta-con-accion">
                <label for="categoriaEvento">Categoría (opcional)</label>
                @if (!esEventoPasado()) {
                  <button
                    type="button"
                    class="boton-nueva-categoria"
                    (click)="mostrarNuevaCategoria.set(!mostrarNuevaCategoria())"
                  >
                    <lucide-icon [img]="iconoAgregar" [size]="12" />
                    <span>{{ mostrarNuevaCategoria() ? 'Cerrar' : 'Nueva' }}</span>
                  </button>
                }
              </div>
              <select
                id="categoriaEvento"
                formControlName="categoriaId"
                class="campo-entrada"
                [disabled]="esEventoPasado()"
              >
                <option value="">Sin categoría</option>
                @for (cat of categorias(); track cat.id) {
                  <option [value]="cat.id">{{ cat.nombre }}</option>
                }
              </select>
            </div>
          </div>

          @if (mostrarNuevaCategoria()) {
            <div class="caja-nueva-categoria">
              <input
                type="text"
                class="campo-entrada"
                [(ngModel)]="nuevaCategoriaNombre"
                [ngModelOptions]="{ standalone: true }"
                placeholder="Nombre de categoría (ej. Trabajo)"
                maxlength="80"
              />
              <input
                type="color"
                class="campo-color"
                [(ngModel)]="nuevaCategoriaColor"
                [ngModelOptions]="{ standalone: true }"
                aria-label="Color de la nueva categoría"
              />
              <button
                type="button"
                class="boton-crear-categoria"
                (click)="crearCategoriaRapida()"
                [disabled]="creandoCategoria()"
              >
                {{ creandoCategoria() ? 'Creando...' : 'Crear' }}
              </button>
            </div>
            @if (errorCategoria()) {
              <span class="mensaje-error">{{ errorCategoria() }}</span>
            }
          }

          <div class="grupo-campo">
            <label for="descripcionEvento">Descripción (opcional)</label>
            <textarea
              id="descripcionEvento"
              rows="3"
              formControlName="descripcion"
              class="campo-entrada"
              placeholder="Notas adicionales sobre el evento"
              [disabled]="esEventoPasado()"
            ></textarea>
          </div>

          <div class="acciones-modal">
            <button type="button" class="boton-cancelar" (click)="cerrar.emit()">
              Cancelar
            </button>
            @if (!esEventoPasado()) {
              <app-boton tipo="submit" [deshabilitado]="guardando()">
                {{ guardando() ? 'Guardando...' : (eventoEditar() ? 'Guardar cambios' : 'Crear evento') }}
              </app-boton>
            }
          </div>
        </form>
      </div>
    </div>
  `,
  styles: `
    .fondo-modal {
      position: fixed;
      inset: 0;
      z-index: 1200;
      background-color: rgb(15 23 42 / 45%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .contenido-modal {
      width: 100%;
      max-width: 520px;
      max-height: 90dvh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: var(--sombra-panel);
    }
    .cabecera-modal {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .titulo-modal {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-texto);
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
    .alerta-error {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 0.75rem 0.875rem;
      border-radius: var(--radio-pequeno);
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      font-size: 0.875rem;
    }
    .icono-alerta {
      flex-shrink: 0;
      margin-top: 0.125rem;
      color: var(--color-peligro);
    }
    .alerta-contenido {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .lista-errores-detalle {
      margin: 0.25rem 0 0 1rem;
      padding: 0;
      font-size: 0.8125rem;
    }
    .formulario-evento {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }
    .fila-doble {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.875rem;
    }
    @media (min-width: 480px) {
      .fila-doble {
        grid-template-columns: 1fr 1fr;
      }
    }
    .grupo-campo {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .grupo-campo label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-texto);
    }
    .campo-invalido {
      border-color: var(--color-peligro) !important;
    }
    .campo-color {
      width: 100%;
      height: 40px;
      padding: 0.25rem;
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-pequeno);
      background-color: var(--color-superficie);
      cursor: pointer;
    }
    .casilla-dia-completo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--color-texto);
      cursor: pointer;
    }
    .acciones-modal {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .boton-cancelar {
      padding: 0.625rem 1rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto);
      font-weight: 500;
      cursor: pointer;
    }
    .boton-cancelar:hover {
      background-color: var(--color-borde);
    }
    .etiqueta-con-accion {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .boton-nueva-categoria {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: none;
      border: none;
      color: var(--color-primario);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }
    .caja-nueva-categoria {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 0.5rem;
      align-items: center;
      padding: 0.625rem;
      border-radius: var(--radio-pequeno);
      background-color: var(--color-superficie-secundaria);
      border: 1px solid var(--color-borde);
    }
    .boton-crear-categoria {
      padding: 0.45rem 0.75rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-primario);
      background-color: var(--color-primario);
      color: #fff;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
    }
    .boton-crear-categoria:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
})
export class FormularioEventoModalComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly eventoService = inject(EventoService);
  private readonly categoriaService = inject(CategoriaService);

  readonly fechaInicial = input<string | null>(null);
  readonly eventoEditar = input<Evento | null>(null);

  readonly cerrar = output<void>();
  readonly guardado = output<Evento>();

  protected readonly iconoCerrar = X;
  protected readonly iconoAlerta = AlertCircle;
  protected readonly iconoAgregar = Plus;

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly mostrarNuevaCategoria = signal(false);
  protected readonly creandoCategoria = signal(false);
  protected readonly errorCategoria = signal<string | null>(null);
  protected nuevaCategoriaNombre = '';
  protected nuevaCategoriaColor = '#4F46E5';

  protected readonly guardando = signal(false);
  protected readonly intentoEnvio = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});

  protected readonly formulario = this.formBuilder.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    tipo: ['EVENTO' as TipoEvento, [Validators.required]],
    color: ['#4f46e5'],
    diaCompleto: [false],
    inicio: ['', [Validators.required]],
    fin: ['', [Validators.required]],
    ubicacion: ['', [Validators.maxLength(200)]],
    categoriaId: [''],
    descripcion: ['', [Validators.maxLength(1000)]],
  });

  protected readonly listaErroresDetalle = computed(() =>
    Object.values(this.erroresServidor())
  );

  ngOnInit(): void {
    this.cargarCategorias();

    const evento = this.eventoEditar();
    if (evento) {
      this.formulario.patchValue({
        titulo: evento.titulo,
        tipo: evento.tipo,
        color: (evento.color ?? COLORES_POR_TIPO[evento.tipo] ?? '#4f46e5').toLowerCase(),
        diaCompleto: evento.diaCompleto,
        inicio: evento.diaCompleto
          ? evento.fechaInicio.substring(0, 10)
          : this.aDatetimeLocal(evento.fechaInicio),
        fin: evento.diaCompleto
          ? evento.fechaFin.substring(0, 10)
          : this.aDatetimeLocal(evento.fechaFin),
        ubicacion: evento.ubicacion ?? '',
        categoriaId: evento.categoriaId ?? '',
        descripcion: evento.descripcion ?? '',
      });
      return;
    }

    const baseFecha = this.fechaInicial() ?? new Date().toISOString().substring(0, 10);
    this.formulario.patchValue({
      inicio: `${baseFecha}T09:00`,
      fin: `${baseFecha}T10:00`,
    });
  }

  protected alCambiarTipo(): void {
    const tipo = this.formulario.controls.tipo.value;
    this.formulario.controls.color.setValue(COLORES_POR_TIPO[tipo] ?? '#4f46e5');
  }

  private cargarCategorias(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (lista) => this.categorias.set(lista),
      error: () => { /* opcional si aún no hay categorías */ },
    });
  }

  protected crearCategoriaRapida(): void {
    const nombre = this.nuevaCategoriaNombre.trim();
    if (nombre.length < 2) {
      this.errorCategoria.set('El nombre de la categoría debe tener al menos 2 caracteres.');
      return;
    }
    this.creandoCategoria.set(true);
    this.errorCategoria.set(null);
    this.categoriaService.crearCategoria({
      nombre,
      color: this.nuevaCategoriaColor,
    }).subscribe({
      next: (creada) => {
        this.categorias.update(lista => [...lista, creada].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        this.formulario.controls.categoriaId.setValue(creada.id);
        this.nuevaCategoriaNombre = '';
        this.mostrarNuevaCategoria.set(false);
        this.creandoCategoria.set(false);
      },
      error: (err) => {
        const errorApi = extraerErrorApi(err, 'No se pudo crear la categoría.');
        this.errorCategoria.set(errorApi.mensaje);
        this.creandoCategoria.set(false);
      },
    });
  }

  protected mostrarErrorCampo(nombreCampo: string): boolean {
    return this.obtenerErrorCampo(nombreCampo) !== null;
  }

  protected obtenerErrorCampo(nombreCampo: string): string | null {
    const mapaServidor = this.erroresServidor();
    const claveServidor =
      nombreCampo === 'inicio' ? 'fechaInicio' : nombreCampo === 'fin' ? 'fechaFin' : nombreCampo;
    if (mapaServidor[claveServidor]) {
      return mapaServidor[claveServidor];
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

  protected esEventoPasado(): boolean {
    const evento = this.eventoEditar();
    if (!evento) return false;
    return new Date(evento.fechaFin) < new Date();
  }

  protected fechaActualISO(): string {
    const ahora = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    // For datetime-local, format YYYY-MM-DDTHH:MM
    return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
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
    const fechaInicioIso = valores.diaCompleto
      ? new Date(`${valores.inicio.substring(0, 10)}T00:00:00`).toISOString()
      : new Date(valores.inicio).toISOString();
    const fechaFinIso = valores.diaCompleto
      ? new Date(`${valores.fin.substring(0, 10)}T23:59:59`).toISOString()
      : new Date(valores.fin).toISOString();

    if (new Date(fechaFinIso) <= new Date(fechaInicioIso)) {
      this.errorMensaje.set('La fecha y hora de finalización deben ser posteriores al inicio.');
      return;
    }

    const ahora = new Date();
    if (valores.diaCompleto) {
      const hoyStr = this.fechaActualISO().substring(0, 10);
      if (valores.inicio.substring(0, 10) < hoyStr) {
        this.errorMensaje.set('No puedes programar un evento en una fecha anterior al día actual.');
        this.erroresServidor.set({
          inicio: 'Selecciona una fecha igual o posterior a hoy.',
        });
        return;
      }
    } else if (new Date(fechaInicioIso) < ahora) {
      this.errorMensaje.set('No puedes programar un evento en una fecha u hora anterior a la actual.');
      this.erroresServidor.set({
        inicio: 'Selecciona una fecha y hora igual o posterior a la actual.',
      });
      return;
    }

    const solicitud = {
      titulo: valores.titulo.trim(),
      tipo: valores.tipo,
      color: valores.color || undefined,
      diaCompleto: valores.diaCompleto,
      fechaInicio: fechaInicioIso,
      fechaFin: fechaFinIso,
      ubicacion: valores.ubicacion.trim() || undefined,
      categoriaId: valores.categoriaId || undefined,
      descripcion: valores.descripcion.trim() || undefined,
    };

    this.guardando.set(true);
    const eventoActual = this.eventoEditar();
    const peticion = eventoActual
      ? this.eventoService.actualizarEvento(eventoActual.id, solicitud)
      : this.eventoService.crearEvento(solicitud);

    peticion.subscribe({
      next: (eventoGuardado) => {
        this.guardando.set(false);
        this.guardado.emit(eventoGuardado);
      },
      error: (err) => {
        this.guardando.set(false);
        const errorApi = extraerErrorApi(err, 'No se pudo guardar el evento.');
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
