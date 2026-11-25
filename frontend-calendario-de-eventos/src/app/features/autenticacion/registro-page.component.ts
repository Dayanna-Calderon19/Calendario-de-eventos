import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertCircle, Check, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { AutenticacionService } from '../../core/services';
import { BotonComponent } from '../../shared/components/boton.component';
import { extraerErrorApi } from '../../shared/utils/error-api.util';

const PATRON_CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,100}$/;

function validadorCoincidenciaContrasena(grupo: AbstractControl): ValidationErrors | null {
  const contrasena = grupo.get('contrasena')?.value;
  const confirmacion = grupo.get('confirmacionContrasena')?.value;
  if (!contrasena || !confirmacion) {
    return null;
  }
  return contrasena === confirmacion ? null : { contrasenasNoCoinciden: true };
}

@Component({
  selector: 'app-registro-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, BotonComponent, LucideAngularModule],
  template: `
    <div class="cabecera-autenticacion">
      <h1 class="titulo-pagina">Crear cuenta</h1>
      <p class="subtitulo-pagina">Registra tu cuenta personal para gestionar tu calendario.</p>
    </div>

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

    <form [formGroup]="formulario" (ngSubmit)="enviar()" class="formulario-autenticacion" novalidate>
      <div class="fila-doble">
        <div class="grupo-campo">
          <label for="nombres">Nombres</label>
          <input
            id="nombres"
            type="text"
            formControlName="nombres"
            class="campo-entrada"
            [class.campo-invalido]="mostrarErrorCampo('nombres')"
            autocomplete="given-name"
          />
          @if (obtenerErrorCampo('nombres')) {
            <span class="mensaje-error">{{ obtenerErrorCampo('nombres') }}</span>
          }
        </div>

        <div class="grupo-campo">
          <label for="apellidos">Apellidos</label>
          <input
            id="apellidos"
            type="text"
            formControlName="apellidos"
            class="campo-entrada"
            [class.campo-invalido]="mostrarErrorCampo('apellidos')"
            autocomplete="family-name"
          />
          @if (obtenerErrorCampo('apellidos')) {
            <span class="mensaje-error">{{ obtenerErrorCampo('apellidos') }}</span>
          }
        </div>
      </div>

      <div class="grupo-campo">
        <label for="correo">Correo electrónico</label>
        <input
          id="correo"
          type="email"
          formControlName="correo"
          class="campo-entrada"
          [class.campo-invalido]="mostrarErrorCampo('correo')"
          autocomplete="email"
        />
        @if (obtenerErrorCampo('correo')) {
          <span class="mensaje-error">{{ obtenerErrorCampo('correo') }}</span>
        }
      </div>

      <div class="grupo-campo">
        <label for="contrasena">Contraseña</label>
        <div class="contenedor-contrasena">
          <input
            id="contrasena"
            [type]="mostrarContrasena() ? 'text' : 'password'"
            formControlName="contrasena"
            class="campo-entrada campo-con-boton"
            [class.campo-invalido]="mostrarErrorCampo('contrasena')"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="boton-ojo"
            (click)="mostrarContrasena.set(!mostrarContrasena())"
            [attr.aria-label]="mostrarContrasena() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            <lucide-icon [img]="mostrarContrasena() ? iconoOcultar : iconoMostrar" [size]="18" />
          </button>
        </div>

        <ul class="requisitos-contrasena" aria-label="Requisitos de la contraseña">
          <li [class.cumplido]="tieneLongitudMinima()">
            <lucide-icon [img]="iconoCheck" [size]="13" /> Mínimo 8 caracteres
          </li>
          <li [class.cumplido]="tieneMayuscula()">
            <lucide-icon [img]="iconoCheck" [size]="13" /> Una mayúscula
          </li>
          <li [class.cumplido]="tieneMinuscula()">
            <lucide-icon [img]="iconoCheck" [size]="13" /> Una minúscula
          </li>
          <li [class.cumplido]="tieneNumero()">
            <lucide-icon [img]="iconoCheck" [size]="13" /> Un número
          </li>
          <li [class.cumplido]="tieneCaracterEspecial()">
            <lucide-icon [img]="iconoCheck" [size]="13" /> Un carácter especial (&#64;&#36;!%*?&#38;)
          </li>
        </ul>

        @if (obtenerErrorCampo('contrasena')) {
          <span class="mensaje-error">{{ obtenerErrorCampo('contrasena') }}</span>
        }
      </div>

      <div class="grupo-campo">
        <label for="confirmacionContrasena">Confirmar contraseña</label>
        <div class="contenedor-contrasena">
          <input
            id="confirmacionContrasena"
            [type]="mostrarConfirmacion() ? 'text' : 'password'"
            formControlName="confirmacionContrasena"
            class="campo-entrada campo-con-boton"
            [class.campo-invalido]="mostrarErrorCampo('confirmacionContrasena')"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="boton-ojo"
            (click)="mostrarConfirmacion.set(!mostrarConfirmacion())"
            [attr.aria-label]="mostrarConfirmacion() ? 'Ocultar confirmación' : 'Mostrar confirmación'"
          >
            <lucide-icon [img]="mostrarConfirmacion() ? iconoOcultar : iconoMostrar" [size]="18" />
          </button>
        </div>
        @if (obtenerErrorCampo('confirmacionContrasena')) {
          <span class="mensaje-error">{{ obtenerErrorCampo('confirmacionContrasena') }}</span>
        }
      </div>

      <app-boton tipo="submit" [deshabilitado]="enviando()">
        {{ enviando() ? 'Registrando...' : 'Registrarme' }}
      </app-boton>
    </form>

    <div class="enlaces-autenticacion">
      <a routerLink="/iniciar-sesion">Ya tengo cuenta</a>
    </div>
  `,
  styles: `
    .cabecera-autenticacion {
      margin-bottom: 1.25rem;
    }
    .alerta-error {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 0.75rem 0.875rem;
      margin-bottom: 1rem;
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
    .formulario-autenticacion {
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
    .contenedor-contrasena {
      position: relative;
      display: flex;
      align-items: center;
    }
    .campo-con-boton {
      padding-right: 2.5rem;
    }
    .boton-ojo {
      position: absolute;
      right: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-texto-secundario);
      padding: 0.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .boton-ojo:hover {
      color: var(--color-texto);
    }
    .requisitos-contrasena {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem 0.75rem;
      margin-top: 0.125rem;
      padding: 0;
      font-size: 0.75rem;
      color: var(--color-texto-secundario);
    }
    .requisitos-contrasena li {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    .requisitos-contrasena li.cumplido {
      color: var(--color-exito);
      font-weight: 500;
    }
    .enlaces-autenticacion {
      margin-top: 1.25rem;
      font-size: 0.875rem;
      color: var(--color-primario);
    }
  `,
})
export class RegistroPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly router = inject(Router);

  protected readonly iconoAlerta = AlertCircle;
  protected readonly iconoMostrar = Eye;
  protected readonly iconoOcultar = EyeOff;
  protected readonly iconoCheck = Check;

  protected readonly enviando = signal(false);
  protected readonly intentoEnvio = signal(false);
  protected readonly mostrarContrasena = signal(false);
  protected readonly mostrarConfirmacion = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});

  protected readonly formulario = this.formBuilder.nonNullable.group(
    {
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      contrasena: ['', [Validators.required, Validators.pattern(PATRON_CONTRASENA)]],
      confirmacionContrasena: ['', [Validators.required]],
    },
    { validators: validadorCoincidenciaContrasena }
  );

  private readonly valorContrasena = toSignal(
    this.formulario.controls.contrasena.valueChanges,
    { initialValue: '' }
  );

  protected readonly tieneLongitudMinima = computed(() => this.valorContrasena().length >= 8);
  protected readonly tieneMayuscula = computed(() => /[A-Z]/.test(this.valorContrasena()));
  protected readonly tieneMinuscula = computed(() => /[a-z]/.test(this.valorContrasena()));
  protected readonly tieneNumero = computed(() => /\d/.test(this.valorContrasena()));
  protected readonly tieneCaracterEspecial = computed(() =>
    /[^a-zA-Z\d]/.test(this.valorContrasena())
  );

  protected readonly listaErroresDetalle = computed(() =>
    Object.values(this.erroresServidor())
  );

  protected mostrarErrorCampo(nombreCampo: string): boolean {
    return this.obtenerErrorCampo(nombreCampo) !== null;
  }

  protected obtenerErrorCampo(nombreCampo: string): string | null {
    const errorServidor = this.erroresServidor()[nombreCampo];
    if (errorServidor) {
      return errorServidor;
    }

    const control = this.formulario.get(nombreCampo);
    if (!control || (!control.touched && !this.intentoEnvio())) {
      return null;
    }

    if (
      nombreCampo === 'confirmacionContrasena' &&
      this.formulario.hasError('contrasenasNoCoinciden') &&
      control.value
    ) {
      return 'Las contraseñas no coinciden.';
    }

    if (!control.errors) {
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
    if (control.hasError('email')) {
      return 'Ingresa un correo electrónico válido.';
    }
    if (control.hasError('pattern')) {
      return 'La contraseña debe tener entre 8 y 100 caracteres e incluir mayúscula, minúscula, número y carácter especial.';
    }

    return null;
  }

  protected enviar(): void {
    this.intentoEnvio.set(true);
    this.formulario.markAllAsTouched();
    this.errorMensaje.set(null);
    this.erroresServidor.set({});

    if (this.formulario.invalid || this.enviando()) {
      this.errorMensaje.set('Revisa los campos marcados antes de continuar.');
      return;
    }

    this.enviando.set(true);

    this.autenticacionService.registrar(this.formulario.getRawValue()).subscribe({
      next: () => {
        this.enviando.set(false);
        void this.router.navigate(['/calendario']);
      },
      error: (err) => {
        this.enviando.set(false);
        const errorApi = extraerErrorApi(err, 'No se pudo completar el registro.');
        this.errorMensaje.set(errorApi.mensaje);
        this.erroresServidor.set(errorApi.detalles);
      },
    });
  }
}
