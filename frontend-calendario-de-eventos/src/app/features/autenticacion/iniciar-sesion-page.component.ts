import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertCircle, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { AutenticacionService } from '../../core/services';
import { BotonComponent } from '../../shared/components/boton.component';
import { extraerErrorApi } from '../../shared/utils/error-api.util';

@Component({
  selector: 'app-iniciar-sesion-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, BotonComponent, LucideAngularModule],
  template: `
    <div class="cabecera-autenticacion">
      <h1 class="titulo-pagina">Iniciar sesión</h1>
      <p class="subtitulo-pagina">Accede a tu calendario personal, eventos y tareas.</p>
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
            autocomplete="current-password"
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
        @if (obtenerErrorCampo('contrasena')) {
          <span class="mensaje-error">{{ obtenerErrorCampo('contrasena') }}</span>
        }
      </div>

      <app-boton tipo="submit" [deshabilitado]="enviando()">
        {{ enviando() ? 'Ingresando...' : 'Ingresar' }}
      </app-boton>
    </form>

    <div class="enlaces-autenticacion">
      <a routerLink="/registro">Crear una cuenta</a>
      <a routerLink="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
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
      gap: 1rem;
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
    .enlaces-autenticacion {
      margin-top: 1.25rem;
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--color-primario);
    }
  `,
})
export class IniciarSesionPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacionService = inject(AutenticacionService);
  private readonly router = inject(Router);

  protected readonly iconoAlerta = AlertCircle;
  protected readonly iconoMostrar = Eye;
  protected readonly iconoOcultar = EyeOff;

  protected readonly enviando = signal(false);
  protected readonly intentoEnvio = signal(false);
  protected readonly mostrarContrasena = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});

  protected readonly formulario = this.formBuilder.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]],
  });

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
    if (!control || (!control.touched && !this.intentoEnvio()) || !control.errors) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    if (control.hasError('email')) {
      return 'Ingresa un correo electrónico válido.';
    }

    return null;
  }

  protected enviar(): void {
    this.intentoEnvio.set(true);
    this.formulario.markAllAsTouched();
    this.errorMensaje.set(null);
    this.erroresServidor.set({});

    if (this.formulario.invalid || this.enviando()) {
      this.errorMensaje.set('Ingresa tu correo y contraseña para continuar.');
      return;
    }

    this.enviando.set(true);

    this.autenticacionService.iniciarSesion(this.formulario.getRawValue()).subscribe({
      next: () => {
        this.enviando.set(false);
        void this.router.navigate(['/calendario']);
      },
      error: (err) => {
        this.enviando.set(false);
        const errorApi = extraerErrorApi(
          err,
          'No se pudo iniciar sesión. Verifica tus credenciales.'
        );
        this.errorMensaje.set(errorApi.mensaje);
        this.erroresServidor.set(errorApi.detalles);
      },
    });
  }
}
