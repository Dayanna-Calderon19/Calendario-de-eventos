import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  LucideAngularModule,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-angular';
import { forkJoin } from 'rxjs';
import {
  Categoria,
  ConfiguracionUsuario,
  FormatoHorario,
  PrimerDiaSemana,
  Usuario,
  VistaCalendarioPreferida,
} from '../../core/models';
import { AutenticacionService, CategoriaService, UsuarioService } from '../../core/services';
import { BotonComponent } from '../../shared/components/boton.component';
import { CargandoComponent } from '../../shared/components/cargando.component';
import { extraerErrorApi } from '../../shared/utils/error-api.util';

const ZONAS_HORARIAS_COMUNES: { valor: string; etiqueta: string }[] = [
  { valor: 'America/Lima', etiqueta: 'America/Lima (UTC-5)' },
  { valor: 'America/Bogota', etiqueta: 'America/Bogota (UTC-5)' },
  { valor: 'America/Mexico_City', etiqueta: 'America/Mexico_City (UTC-6)' },
  { valor: 'America/Santiago', etiqueta: 'America/Santiago (UTC-4/-3)' },
  { valor: 'America/Argentina/Buenos_Aires', etiqueta: 'America/Buenos_Aires (UTC-3)' },
  { valor: 'America/New_York', etiqueta: 'America/New_York (UTC-5/-4)' },
  { valor: 'Europe/Madrid', etiqueta: 'Europe/Madrid (UTC+1/+2)' },
  { valor: 'UTC', etiqueta: 'UTC (Tiempo Universal Coordinado)' },
];

const COLORES_SUGERIDOS = [
  '#4f46e5',
  '#0891b2',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
];

@Component({
  selector: 'app-configuracion-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    BotonComponent,
    CargandoComponent,
  ],
  template: `
    <section class="pagina-configuracion">
      <header class="cabecera-seccion">
        <div>
          <h1 class="titulo-pagina">Configuración</h1>
          <p class="subtitulo-pagina">
            Administra tu perfil, zona horaria, formato horario, preferencias del calendario y cuenta.
          </p>
        </div>
      </header>

      @if (errorCarga()) {
        <div class="alerta-error" role="alert">
          <div class="alerta-izquierda">
            <lucide-icon [img]="iconoAlerta" [size]="18" />
            <span>{{ errorCarga() }}</span>
          </div>
          <button type="button" class="boton-reintentar" (click)="cargarDatos()">
            <lucide-icon [img]="iconoRecargar" [size]="14" />
            <span>Reintentar</span>
          </button>
        </div>
      }

      @if (mensajeExito()) {
        <div class="alerta-exito" role="status">
          <lucide-icon [img]="iconoExito" [size]="18" />
          <span>{{ mensajeExito() }}</span>
        </div>
      }

      @if (cargando()) {
        <app-cargando mensaje="Cargando tu perfil y preferencias..." />
      } @else {
        <div class="rejilla-configuracion">
          <!-- Tarjeta de Perfil -->
          <article class="tarjeta seccion-tarjeta">
            <div class="cabecera-tarjeta">
              <div class="icono-seccion">
                <lucide-icon [img]="iconoUsuario" [size]="18" />
              </div>
              <div>
                <h2 class="titulo-tarjeta">Datos del perfil</h2>
                <p class="subtitulo-tarjeta">Información básica de tu cuenta.</p>
              </div>
            </div>

            @if (errorPerfil()) {
              <div class="alerta-error-compacta" role="alert">
                <lucide-icon [img]="iconoAlerta" [size]="16" />
                <span>{{ errorPerfil() }}</span>
              </div>
            }

            <form [formGroup]="formularioPerfil" (ngSubmit)="guardarPerfil()" class="formulario">
              <div class="fila-campos">
                <div class="grupo-campo">
                  <label for="cfg-nombres" class="etiqueta">Nombres</label>
                  <input
                    id="cfg-nombres"
                    type="text"
                    class="campo-entrada"
                    formControlName="nombres"
                    placeholder="Tus nombres"
                  />
                  @if (campoInvalido(formularioPerfil, 'nombres')) {
                    <span class="mensaje-error">
                      Ingresa entre 2 y 100 caracteres para tus nombres.
                    </span>
                  }
                </div>

                <div class="grupo-campo">
                  <label for="cfg-apellidos" class="etiqueta">Apellidos</label>
                  <input
                    id="cfg-apellidos"
                    type="text"
                    class="campo-entrada"
                    formControlName="apellidos"
                    placeholder="Tus apellidos"
                  />
                  @if (campoInvalido(formularioPerfil, 'apellidos')) {
                    <span class="mensaje-error">
                      Ingresa entre 2 y 100 caracteres para tus apellidos.
                    </span>
                  }
                </div>
              </div>

              <div class="grupo-campo">
                <label for="cfg-correo" class="etiqueta">Correo electrónico</label>
                <input
                  id="cfg-correo"
                  type="email"
                  class="campo-entrada campo-solo-lectura"
                  [value]="usuario()?.correo ?? ''"
                  readonly
                />
              </div>

              <div class="acciones-tarjeta">
                <app-boton
                  tipo="submit"
                  variante="primario"
                  [cargando]="guardandoPerfil()"
                  [deshabilitado]="formularioPerfil.invalid"
                >
                  <lucide-icon [img]="iconoGuardar" [size]="16" />
                  <span>{{ guardandoPerfil() ? 'Guardando...' : 'Guardar perfil' }}</span>
                </app-boton>
              </div>
            </form>
          </article>

          <!-- Tarjeta de Preferencias del Calendario y Notificaciones (RF-078 a RF-083) -->
          <article class="tarjeta seccion-tarjeta">
            <div class="cabecera-tarjeta">
              <div class="icono-seccion">
                <lucide-icon [img]="iconoCalendario" [size]="18" />
              </div>
              <div>
                <h2 class="titulo-tarjeta">Preferencias del calendario y notificaciones</h2>
                <p class="subtitulo-tarjeta">
                  Personaliza la zona horaria, formato de hora, apariencia y alertas.
                </p>
              </div>
            </div>

            @if (errorConfiguracion()) {
              <div class="alerta-error-compacta" role="alert">
                <lucide-icon [img]="iconoAlerta" [size]="16" />
                <span>{{ errorConfiguracion() }}</span>
              </div>
            }

            <form
              [formGroup]="formularioConfiguracion"
              (ngSubmit)="guardarConfiguracion()"
              class="formulario"
            >
              <div class="fila-campos">
                <!-- RF-078: Zona horaria -->
                <div class="grupo-campo">
                  <label for="cfg-zona" class="etiqueta">
                    <lucide-icon [img]="iconoReloj" [size]="14" />
                    <span>Zona horaria</span>
                  </label>
                  <select id="cfg-zona" class="campo-entrada" formControlName="zonaHoraria">
                    @for (zona of zonasDisponibles(); track zona.valor) {
                      <option [value]="zona.valor">{{ zona.etiqueta }}</option>
                    }
                  </select>
                </div>

                <!-- RF-083: Vista preferida -->
                <div class="grupo-campo">
                  <label for="cfg-vista" class="etiqueta">Vista de calendario preferida</label>
                  <select id="cfg-vista" class="campo-entrada" formControlName="vistaPreferida">
                    <option value="MES">Mes</option>
                    <option value="SEMANA">Semana</option>
                    <option value="DIA">Día</option>
                    <option value="AGENDA">Agenda</option>
                  </select>
                </div>
              </div>

              <div class="fila-campos">
                <!-- RF-079: Formato horario -->
                <div class="grupo-campo">
                  <span class="etiqueta">Formato horario</span>
                  <div class="grupo-opciones" role="radiogroup" aria-label="Formato horario">
                    <label
                      class="opcion-chip"
                      [class.opcion-activa]="formularioConfiguracion.value.formatoHorario === 'H24'"
                    >
                      <input type="radio" formControlName="formatoHorario" value="H24" />
                      <span>24 horas (14:30)</span>
                    </label>
                    <label
                      class="opcion-chip"
                      [class.opcion-activa]="formularioConfiguracion.value.formatoHorario === 'H12'"
                    >
                      <input type="radio" formControlName="formatoHorario" value="H12" />
                      <span>12 horas (2:30 p. m.)</span>
                    </label>
                  </div>
                </div>

                <!-- RF-082: Primer día de la semana -->
                <div class="grupo-campo">
                  <span class="etiqueta">Primer día de la semana</span>
                  <div class="grupo-opciones" role="radiogroup" aria-label="Primer día de la semana">
                    <label
                      class="opcion-chip"
                      [class.opcion-activa]="
                        formularioConfiguracion.value.primerDiaSemana === 'LUNES'
                      "
                    >
                      <input type="radio" formControlName="primerDiaSemana" value="LUNES" />
                      <span>Lunes</span>
                    </label>
                    <label
                      class="opcion-chip"
                      [class.opcion-activa]="
                        formularioConfiguracion.value.primerDiaSemana === 'DOMINGO'
                      "
                    >
                      <input type="radio" formControlName="primerDiaSemana" value="DOMINGO" />
                      <span>Domingo</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- RF-080: Color predeterminado -->
              <div class="grupo-campo">
                <label for="cfg-color-hex" class="etiqueta">
                  <lucide-icon [img]="iconoPaleta" [size]="14" />
                  <span>Color predeterminado para nuevos eventos</span>
                </label>
                <div class="selector-color-contenedor">
                  <div class="paleta-colores">
                    @for (color of coloresSugeridos; track color) {
                      <button
                        type="button"
                        class="muestra-color"
                        [style.background-color]="color"
                        [class.muestra-activa]="
                          formularioConfiguracion.value.colorPredeterminado?.toLowerCase() === color
                        "
                        (click)="seleccionarColor(color)"
                        [attr.aria-label]="'Seleccionar color ' + color"
                      ></button>
                    }
                  </div>
                  <div class="color-personalizado">
                    <input
                      type="color"
                      class="input-color-nativo"
                      [value]="formularioConfiguracion.value.colorPredeterminado || '#4f46e5'"
                      (input)="seleccionarColor($any($event.target).value)"
                      aria-label="Selector de color personalizado"
                    />
                    <input
                      id="cfg-color-hex"
                      type="text"
                      class="campo-entrada input-hex"
                      formControlName="colorPredeterminado"
                      placeholder="#4f46e5"
                      maxlength="7"
                    />
                  </div>
                </div>
                @if (campoInvalido(formularioConfiguracion, 'colorPredeterminado')) {
                  <span class="mensaje-error">
                    Ingresa un color hexadecimal válido (ejemplo: #4f46e5).
                  </span>
                }
              </div>

              <!-- RF-081: Notificaciones activas -->
              <label class="interruptor-fila">
                <div class="interruptor-info">
                  <div class="interruptor-titulo">
                    <lucide-icon [img]="iconoNotificacion" [size]="16" />
                    <span>Notificaciones de la aplicación</span>
                  </div>
                  <p class="interruptor-descripcion">
                    Recibe avisos dentro de la aplicación sobre recordatorios de eventos y tareas.
                  </p>
                </div>
                <input
                  type="checkbox"
                  class="interruptor-check"
                  formControlName="notificacionesActivas"
                />
              </label>

              <div class="acciones-tarjeta">
                <app-boton
                  tipo="submit"
                  variante="primario"
                  [cargando]="guardandoConfiguracion()"
                  [deshabilitado]="formularioConfiguracion.invalid"
                >
                  <lucide-icon [img]="iconoGuardar" [size]="16" />
                  <span>
                    {{ guardandoConfiguracion() ? 'Guardando...' : 'Guardar preferencias' }}
                  </span>
                </app-boton>
              </div>
            </form>
          </article>

          <!-- Tarjeta de Gestión de Categorías -->
          <article class="tarjeta seccion-tarjeta">
            <div class="cabecera-tarjeta">
              <div class="icono-seccion">
                <lucide-icon [img]="iconoEtiqueta" [size]="18" />
              </div>
              <div>
                <h2 class="titulo-tarjeta">Categorías personalizadas</h2>
                <p class="subtitulo-tarjeta">
                  Crea, edita o elimina las categorías que usas para organizar eventos y tareas.
                </p>
              </div>
            </div>

            @if (errorCategoria()) {
              <div class="alerta-error-compacta" role="alert">
                <lucide-icon [img]="iconoAlerta" [size]="16" />
                <span>{{ errorCategoria() }}</span>
              </div>
            }

            <form (ngSubmit)="crearCategoria()" class="fila-nueva-categoria">
              <input
                type="text"
                class="campo-entrada"
                [(ngModel)]="nuevaCategoriaNombre"
                name="nuevaCategoriaNombre"
                placeholder="Nombre de la nueva categoría (ej. Trabajo)"
                maxlength="80"
              />
              <input
                type="color"
                class="input-color-nativo"
                [(ngModel)]="nuevaCategoriaColor"
                name="nuevaCategoriaColor"
                aria-label="Color de la nueva categoría"
              />
              <app-boton
                tipo="submit"
                variante="primario"
                [cargando]="guardandoCategoria()"
                [deshabilitado]="!nuevaCategoriaNombre.trim()"
              >
                <lucide-icon [img]="iconoAgregar" [size]="16" />
                <span>Agregar</span>
              </app-boton>
            </form>

            @if (categorias().length === 0) {
              <p class="texto-vacio-categorias">
                Aún no tienes categorías creadas. Agrega una arriba para comenzar.
              </p>
            } @else {
              <ul class="lista-categorias" role="list">
                @for (cat of categorias(); track cat.id) {
                  <li class="item-categoria">
                    @if (categoriaEditandoId() === cat.id) {
                      <div class="edicion-categoria">
                        <input
                          type="color"
                          class="input-color-nativo"
                          [(ngModel)]="categoriaEditandoColor"
                          aria-label="Editar color de categoría"
                        />
                        <input
                          type="text"
                          class="campo-entrada"
                          [(ngModel)]="categoriaEditandoNombre"
                          maxlength="80"
                          aria-label="Editar nombre de categoría"
                        />
                        <div class="acciones-categoria">
                          <button
                            type="button"
                            class="boton-chip-primario"
                            (click)="guardarEdicionCategoria(cat.id)"
                            [disabled]="guardandoCategoria() || !categoriaEditandoNombre.trim()"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            class="boton-chip-secundario"
                            (click)="cancelarEdicionCategoria()"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="info-categoria">
                        <span class="muestra-categoria" [style.background-color]="cat.color"></span>
                        <span class="nombre-categoria">{{ cat.nombre }}</span>
                      </div>

                      <div class="acciones-categoria">
                        @if (categoriaConfirmarEliminarId() === cat.id) {
                          <span class="texto-confirmar-eliminar">¿Eliminar?</span>
                          <button
                            type="button"
                            class="boton-chip-peligro"
                            (click)="eliminarCategoria(cat.id)"
                            [disabled]="eliminandoCategoriaId() === cat.id"
                          >
                            {{ eliminandoCategoriaId() === cat.id ? 'Eliminando...' : 'Sí' }}
                          </button>
                          <button
                            type="button"
                            class="boton-chip-secundario"
                            (click)="categoriaConfirmarEliminarId.set(null)"
                          >
                            No
                          </button>
                        } @else {
                          <button
                            type="button"
                            class="boton-icono-categoria"
                            (click)="iniciarEdicionCategoria(cat)"
                            title="Editar categoría"
                            aria-label="Editar categoría"
                          >
                            <lucide-icon [img]="iconoEditar" [size]="15" />
                          </button>
                          <button
                            type="button"
                            class="boton-icono-categoria boton-icono-peligro"
                            (click)="categoriaConfirmarEliminarId.set(cat.id)"
                            title="Eliminar categoría"
                            aria-label="Eliminar categoría"
                          >
                            <lucide-icon [img]="iconoEliminar" [size]="15" />
                          </button>
                        }
                      </div>
                    }
                  </li>
                }
              </ul>
            }
          </article>

          <!-- RF-084: Zona de peligro (Eliminación de cuenta) -->
          <article class="tarjeta seccion-tarjeta zona-peligro">
            <div class="cabecera-tarjeta">
              <div class="icono-seccion icono-peligro">
                <lucide-icon [img]="iconoAdvertencia" [size]="18" />
              </div>
              <div>
                <h2 class="titulo-tarjeta titulo-peligro">Eliminar cuenta</h2>
                <p class="subtitulo-tarjeta">
                  Esta acción es permanente y eliminará tu cuenta junto con todos tus datos asociados
                  (eventos, tareas, categorías, recordatorios, notificaciones y configuración).
                </p>
              </div>
            </div>

            <div class="acciones-tarjeta">
              <app-boton variante="peligroso" tipo="button" (alPulsar)="abrirModalEliminacion()">
                <lucide-icon [img]="iconoEliminar" [size]="16" />
                <span>Solicitar eliminación de cuenta</span>
              </app-boton>
            </div>
          </article>
        </div>
      }

      <!-- Modal de confirmación para eliminar cuenta (RF-084) -->
      @if (modalEliminacionAbierto()) {
        <div class="fondo-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-eliminar">
          <div class="tarjeta modal-confirmacion">
            <header class="cabecera-modal">
              <div class="titulo-modal-bloque">
                <lucide-icon [img]="iconoAdvertencia" [size]="20" class="texto-peligro" />
                <h2 id="titulo-modal-eliminar">Confirmar eliminación de cuenta</h2>
              </div>
              <button
                type="button"
                class="boton-cerrar"
                (click)="cerrarModalEliminacion()"
                aria-label="Cerrar ventana"
              >
                <lucide-icon [img]="iconoCerrar" [size]="18" />
              </button>
            </header>

            <div class="cuerpo-modal">
              <p class="texto-alcance">
                Al confirmar, se eliminarán de forma definitiva e irreversible:
              </p>
              <ul class="lista-alcance">
                <li>Tu perfil de usuario y credenciales de acceso.</li>
                <li>Todos tus eventos, citas y fechas importantes.</li>
                <li>Todas tus tareas, categorías, recordatorios y notificaciones.</li>
                <li>Tus preferencias personalizadas del calendario.</li>
              </ul>

              <div class="grupo-campo">
                <label for="confirmar-eliminar-texto" class="etiqueta">
                  Escribe <strong>ELIMINAR</strong> para confirmar:
                </label>
                <input
                  id="confirmar-eliminar-texto"
                  type="text"
                  class="campo-entrada"
                  [value]="textoConfirmacion()"
                  (input)="textoConfirmacion.set($any($event.target).value)"
                  placeholder="ELIMINAR"
                  autocomplete="off"
                />
              </div>

              @if (errorEliminacion()) {
                <div class="alerta-error-compacta" role="alert">
                  <lucide-icon [img]="iconoAlerta" [size]="16" />
                  <span>{{ errorEliminacion() }}</span>
                </div>
              }
            </div>

            <footer class="acciones-modal">
              <app-boton
                variante="secundario"
                tipo="button"
                [deshabilitado]="eliminandoCuenta()"
                (alPulsar)="cerrarModalEliminacion()"
              >
                Cancelar
              </app-boton>
              <app-boton
                variante="peligroso"
                tipo="button"
                [cargando]="eliminandoCuenta()"
                [deshabilitado]="textoConfirmacion().trim().toUpperCase() !== 'ELIMINAR'"
                (alPulsar)="confirmarEliminacionCuenta()"
              >
                <lucide-icon [img]="iconoEliminar" [size]="16" />
                <span>
                  {{ eliminandoCuenta() ? 'Eliminando...' : 'Eliminar permanentemente' }}
                </span>
              </app-boton>
            </footer>
          </div>
        </div>
      }
    </section>
  `,
  styles: `
    .pagina-configuracion {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 960px;
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

    .rejilla-configuracion {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .seccion-tarjeta {
      display: flex;
      flex-direction: column;
      gap: 1.125rem;
    }

    .cabecera-tarjeta {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .icono-seccion {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radio-pequeno);
      background-color: var(--color-primario-suave);
      color: var(--color-primario);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icono-peligro {
      background-color: #fef2f2;
      color: var(--color-peligro);
    }

    .titulo-tarjeta {
      margin: 0;
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--color-texto);
    }

    .titulo-peligro,
    .texto-peligro {
      color: var(--color-peligro);
    }

    .subtitulo-tarjeta {
      margin: 0.125rem 0 0;
      font-size: 0.875rem;
      color: var(--color-texto-secundario);
    }

    .formulario {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .fila-campos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1rem;
    }

    .grupo-campo {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .etiqueta {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-texto);
    }

    .campo-solo-lectura {
      background-color: var(--color-superficie-secundaria);
      color: var(--color-texto-secundario);
      cursor: not-allowed;
    }

    .grupo-opciones {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .opcion-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie);
      font-size: 0.875rem;
      cursor: pointer;
      transition: border-color var(--transicion-base), background-color var(--transicion-base);
    }

    .opcion-chip input {
      accent-color: var(--color-primario);
      cursor: pointer;
    }

    .opcion-activa {
      border-color: var(--color-primario);
      background-color: var(--color-primario-suave);
      color: var(--color-primario);
      font-weight: 600;
    }

    .selector-color-contenedor {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .paleta-colores {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .muestra-color {
      width: 1.875rem;
      height: 1.875rem;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform var(--transicion-base);
    }

    .muestra-color:hover {
      transform: scale(1.08);
    }

    .muestra-activa {
      border-color: var(--color-texto);
      box-shadow: 0 0 0 2px var(--color-superficie) inset;
    }

    .color-personalizado {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .input-color-nativo {
      width: 2.25rem;
      height: 2.25rem;
      padding: 0;
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-pequeno);
      background: transparent;
      cursor: pointer;
    }

    .input-hex {
      width: 6.5rem;
      font-family: monospace;
    }

    .interruptor-fila {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie-secundaria);
      cursor: pointer;
    }

    .interruptor-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .interruptor-titulo {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--color-texto);
    }

    .interruptor-descripcion {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--color-texto-secundario);
    }

    .interruptor-check {
      width: 1.25rem;
      height: 1.25rem;
      accent-color: var(--color-primario);
      cursor: pointer;
      flex-shrink: 0;
    }

    .acciones-tarjeta {
      display: flex;
      justify-content: flex-end;
    }

    .zona-peligro {
      border-color: #fecaca;
    }

    .alerta-error,
    .alerta-error-compacta {
      display: flex;
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

    .alerta-error-compacta {
      justify-content: flex-start;
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

    .alerta-exito {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radio-pequeno);
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: var(--color-exito);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .fondo-modal {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 60;
    }

    .modal-confirmacion {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cabecera-modal {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .titulo-modal-bloque {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .titulo-modal-bloque h2 {
      margin: 0;
      font-size: 1.125rem;
      color: var(--color-texto);
    }

    .boton-cerrar {
      border: 0;
      background: transparent;
      color: var(--color-texto-secundario);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--radio-pequeno);
    }

    .cuerpo-modal {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .texto-alcance {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-texto);
    }

    .lista-alcance {
      margin: 0;
      padding-left: 1.25rem;
      font-size: 0.875rem;
      color: var(--color-texto-secundario);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .acciones-modal {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 0.5rem;
    }

    .fila-nueva-categoria {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.625rem;
    }

    .fila-nueva-categoria .campo-entrada {
      flex: 1;
      min-width: 200px;
    }

    .texto-vacio-categorias {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-texto-secundario);
    }

    .lista-categorias {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .item-categoria {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.625rem 0.875rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid var(--color-borde);
      background-color: var(--color-superficie-secundaria);
    }

    .info-categoria {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      min-width: 0;
    }

    .muestra-categoria {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .nombre-categoria {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--color-texto);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .edicion-categoria {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
    }

    .edicion-categoria .campo-entrada {
      flex: 1;
      min-width: 160px;
    }

    .acciones-categoria {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      flex-shrink: 0;
    }

    .boton-icono-categoria {
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
    }

    .boton-icono-categoria:hover {
      color: var(--color-primario);
      border-color: var(--color-primario);
    }

    .boton-icono-peligro:hover {
      color: var(--color-peligro);
      border-color: var(--color-peligro);
    }

    .texto-confirmar-eliminar {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-peligro);
    }

    .boton-chip-primario,
    .boton-chip-secundario,
    .boton-chip-peligro {
      padding: 0.35rem 0.65rem;
      border-radius: var(--radio-pequeno);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .boton-chip-primario {
      background-color: var(--color-primario);
      color: #ffffff;
    }

    .boton-chip-secundario {
      background-color: var(--color-superficie);
      border-color: var(--color-borde);
      color: var(--color-texto);
    }

    .boton-chip-peligro {
      background-color: var(--color-peligro);
      color: #ffffff;
    }
  `,
})
export class ConfiguracionPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly autenticacionService = inject(AutenticacionService);

  protected readonly iconoUsuario = User;
  protected readonly iconoCalendario = Calendar;
  protected readonly iconoReloj = Clock;
  protected readonly iconoPaleta = Palette;
  protected readonly iconoNotificacion = Bell;
  protected readonly iconoGuardar = Save;
  protected readonly iconoAlerta = AlertCircle;
  protected readonly iconoAdvertencia = AlertTriangle;
  protected readonly iconoExito = CheckCircle2;
  protected readonly iconoRecargar = RefreshCw;
  protected readonly iconoEliminar = Trash2;
  protected readonly iconoCerrar = X;
  protected readonly iconoEtiqueta = Tag;
  protected readonly iconoAgregar = Plus;
  protected readonly iconoEditar = Edit2;

  protected readonly coloresSugeridos = COLORES_SUGERIDOS;

  protected readonly cargando = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly errorPerfil = signal<string | null>(null);
  protected readonly errorConfiguracion = signal<string | null>(null);
  protected readonly errorEliminacion = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected readonly guardandoPerfil = signal(false);
  protected readonly guardandoConfiguracion = signal(false);
  protected readonly eliminandoCuenta = signal(false);
  protected readonly modalEliminacionAbierto = signal(false);
  protected readonly textoConfirmacion = signal('');

  protected readonly usuario = signal<Usuario | null>(null);
  protected readonly zonasDisponibles = signal(ZONAS_HORARIAS_COMUNES);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly errorCategoria = signal<string | null>(null);
  protected readonly guardandoCategoria = signal(false);
  protected readonly eliminandoCategoriaId = signal<string | null>(null);
  protected readonly categoriaConfirmarEliminarId = signal<string | null>(null);
  protected readonly categoriaEditandoId = signal<string | null>(null);
  protected nuevaCategoriaNombre = '';
  protected nuevaCategoriaColor = '#4f46e5';
  protected categoriaEditandoNombre = '';
  protected categoriaEditandoColor = '#4f46e5';

  protected readonly formularioPerfil = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  protected readonly formularioConfiguracion = this.fb.nonNullable.group({
    zonaHoraria: ['America/Lima', [Validators.required]],
    formatoHorario: ['H24' as FormatoHorario, [Validators.required]],
    primerDiaSemana: ['LUNES' as PrimerDiaSemana, [Validators.required]],
    vistaPreferida: ['MES' as VistaCalendarioPreferida, [Validators.required]],
    colorPredeterminado: ['#4f46e5', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
    notificacionesActivas: [true],
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  protected cargarDatos(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    forkJoin({
      perfil: this.usuarioService.obtenerPerfil(),
      configuracion: this.usuarioService.obtenerConfiguracion(),
      categorias: this.categoriaService.listarCategorias(),
    }).subscribe({
      next: ({ perfil, configuracion, categorias }) => {
        this.usuario.set(perfil);
        this.formularioPerfil.patchValue({
          nombres: perfil.nombres,
          apellidos: perfil.apellidos,
        });

        this.asegurarZonaEnLista(configuracion.zonaHoraria);
        this.formularioConfiguracion.patchValue(configuracion);
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: (err) => {
        const api = extraerErrorApi(
          err,
          'No se pudo cargar tu configuración. Verifica tu conexión e intenta nuevamente.'
        );
        this.errorCarga.set(api.mensaje);
        this.cargando.set(false);
      },
    });
  }

  protected guardarPerfil(): void {
    if (this.formularioPerfil.invalid || this.guardandoPerfil()) {
      this.formularioPerfil.markAllAsTouched();
      return;
    }

    this.guardandoPerfil.set(true);
    this.errorPerfil.set(null);
    const { nombres, apellidos } = this.formularioPerfil.getRawValue();

    this.usuarioService
      .actualizarPerfil({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
      })
      .subscribe({
        next: (perfilActualizado) => {
          this.usuario.set(perfilActualizado);
          this.guardandoPerfil.set(false);
          this.mostrarExitoTemporal('Perfil actualizado correctamente.');
        },
        error: (err) => {
          const api = extraerErrorApi(err, 'No se pudo actualizar tu perfil.');
          this.errorPerfil.set(api.mensaje);
          this.guardandoPerfil.set(false);
        },
      });
  }

  protected guardarConfiguracion(): void {
    if (this.formularioConfiguracion.invalid || this.guardandoConfiguracion()) {
      this.formularioConfiguracion.markAllAsTouched();
      return;
    }

    this.guardandoConfiguracion.set(true);
    this.errorConfiguracion.set(null);
    const valores: ConfiguracionUsuario = this.formularioConfiguracion.getRawValue();

    this.usuarioService.actualizarConfiguracion(valores).subscribe({
      next: (guardada) => {
        this.formularioConfiguracion.patchValue(guardada);
        this.guardandoConfiguracion.set(false);
        this.mostrarExitoTemporal('Preferencias guardadas correctamente.');
      },
      error: (err) => {
        const api = extraerErrorApi(err, 'No se pudieron guardar tus preferencias.');
        this.errorConfiguracion.set(api.mensaje);
        this.guardandoConfiguracion.set(false);
      },
    });
  }

  protected seleccionarColor(color: string): void {
    this.formularioConfiguracion.patchValue({ colorPredeterminado: color.toLowerCase() });
  }

  protected crearCategoria(): void {
    const nombre = this.nuevaCategoriaNombre.trim();
    if (!nombre || this.guardandoCategoria()) return;

    this.guardandoCategoria.set(true);
    this.errorCategoria.set(null);

    this.categoriaService
      .crearCategoria({ nombre, color: this.nuevaCategoriaColor })
      .subscribe({
        next: (creada) => {
          this.categorias.update((lista) =>
            [...lista, creada].sort((a, b) => a.nombre.localeCompare(b.nombre))
          );
          this.nuevaCategoriaNombre = '';
          this.guardandoCategoria.set(false);
          this.mostrarExitoTemporal('Categoría creada correctamente.');
        },
        error: (err) => {
          const api = extraerErrorApi(err, 'No se pudo crear la categoría.');
          this.errorCategoria.set(api.mensaje);
          this.guardandoCategoria.set(false);
        },
      });
  }

  protected iniciarEdicionCategoria(cat: Categoria): void {
    this.errorCategoria.set(null);
    this.categoriaConfirmarEliminarId.set(null);
    this.categoriaEditandoId.set(cat.id);
    this.categoriaEditandoNombre = cat.nombre;
    this.categoriaEditandoColor = cat.color;
  }

  protected cancelarEdicionCategoria(): void {
    this.categoriaEditandoId.set(null);
  }

  protected guardarEdicionCategoria(id: string): void {
    const nombre = this.categoriaEditandoNombre.trim();
    if (!nombre || this.guardandoCategoria()) return;

    this.guardandoCategoria.set(true);
    this.errorCategoria.set(null);

    this.categoriaService
      .actualizarCategoria(id, { nombre, color: this.categoriaEditandoColor })
      .subscribe({
        next: (actualizada) => {
          this.categorias.update((lista) =>
            lista
              .map((c) => (c.id === actualizada.id ? actualizada : c))
              .sort((a, b) => a.nombre.localeCompare(b.nombre))
          );
          this.categoriaEditandoId.set(null);
          this.guardandoCategoria.set(false);
          this.mostrarExitoTemporal('Categoría actualizada correctamente.');
        },
        error: (err) => {
          const api = extraerErrorApi(err, 'No se pudo actualizar la categoría.');
          this.errorCategoria.set(api.mensaje);
          this.guardandoCategoria.set(false);
        },
      });
  }

  protected eliminarCategoria(id: string): void {
    if (this.eliminandoCategoriaId()) return;
    this.eliminandoCategoriaId.set(id);
    this.errorCategoria.set(null);

    this.categoriaService.eliminarCategoria(id).subscribe({
      next: () => {
        this.categorias.update((lista) => lista.filter((c) => c.id !== id));
        this.eliminandoCategoriaId.set(null);
        this.categoriaConfirmarEliminarId.set(null);
        this.mostrarExitoTemporal('Categoría eliminada correctamente.');
      },
      error: (err) => {
        const api = extraerErrorApi(err, 'No se pudo eliminar la categoría.');
        this.errorCategoria.set(api.mensaje);
        this.eliminandoCategoriaId.set(null);
      },
    });
  }

  protected abrirModalEliminacion(): void {
    this.textoConfirmacion.set('');
    this.errorEliminacion.set(null);
    this.modalEliminacionAbierto.set(true);
  }

  protected cerrarModalEliminacion(): void {
    if (this.eliminandoCuenta()) return;
    this.modalEliminacionAbierto.set(false);
  }

  protected confirmarEliminacionCuenta(): void {
    if (this.textoConfirmacion().trim().toUpperCase() !== 'ELIMINAR' || this.eliminandoCuenta()) {
      return;
    }

    this.eliminandoCuenta.set(true);
    this.errorEliminacion.set(null);

    this.usuarioService.eliminarCuenta().subscribe({
      next: () => {
        this.eliminandoCuenta.set(false);
        this.modalEliminacionAbierto.set(false);
        this.autenticacionService.limpiarSesion();
        this.router.navigate(['/iniciar-sesion']);
      },
      error: (err) => {
        const api = extraerErrorApi(
          err,
          'No se pudo eliminar tu cuenta en este momento. Intenta nuevamente.'
        );
        this.errorEliminacion.set(api.mensaje);
        this.eliminandoCuenta.set(false);
      },
    });
  }

  protected campoInvalido(form: { get: (name: string) => { invalid?: boolean; touched?: boolean; dirty?: boolean } | null }, campo: string): boolean {
    const control = form.get(campo);
    return Boolean(control && control.invalid && (control.touched || control.dirty));
  }

  private asegurarZonaEnLista(zona: string): void {
    if (!zona || this.zonasDisponibles().some((z) => z.valor === zona)) {
      return;
    }
    this.zonasDisponibles.update((lista) => [{ valor: zona, etiqueta: zona }, ...lista]);
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
