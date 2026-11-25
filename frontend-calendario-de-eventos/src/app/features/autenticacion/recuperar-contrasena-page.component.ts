import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertCircle, CheckCircle2, LucideAngularModule } from 'lucide-angular';
import { AutenticacionService } from '../../core/services';
import { BotonComponent } from '../../shared/components/boton.component';
import { extraerErrorApi } from '../../shared/utils/error-api.util';

@Component({
  selector: 'app-recuperar-contrasena-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, BotonComponent, LucideAngularModule],
  template: `
    <div class="cabecera-autenticacion">
      <h1 class="titulo-pagina">Recuperar contraseña</h1>
      <p class="subtitulo-pagina">Ingresa tu correo para recibir instrucciones de recuperación.</p>
    </div>

    @if (errorMensaje()) {
      <div class="alerta-error" role="alert">
        <lucide-icon [img]="iconoAlerta" [size]="18" class="icono-alerta" />
        <span>{{ errorMensaje() }}</span>
      </div>
    }

    @if (enviado()) {
      <div class="alerta-exito" role="status">
        <lucide-icon [img]="iconoExito" [size]="18" class="icono-exito" />
        <span>Si el correo está registrado, recibirás un enlace temporal para restablecer tu contraseña.</span>
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
          [class.campo-invalido]="mostrarErrorCorreo()"
          autocomplete="email"
        />
        @if (obtenerErrorCorreo()) {
          <span class="mensaje-error">{{ obtenerErrorCorreo() }}</span>
        }
      </div>

      <app-boton tipo="submit" [deshabilitado]="enviando()">
        {{ enviando() ? 'Enviando...' : 'Enviar solicitud' }}
      </app-boton>
    </form>

    <div class="enlaces-autenticacion">
      <a routerLink="/iniciar-sesion">Volver a iniciar sesión</a>
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
    .alerta-exito {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 0.75rem 0.875rem;
      margin-bottom: 1rem;
      border-radius: var(--radio-pequeno);
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      font-size: 0.875rem;
    }
    .icono-exito {
      flex-shrink: 0;
      margin-top: 0.125rem;
      color: var(--color-exito);
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
    .enlaces-autenticacion {
      margin-top: 1.25rem;
      font-size: 0.875rem;
      color: var(--color-primario);
    }
  `,
})
export class RecuperarContrasenaPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacionService = inject(AutenticacionService);

  protected readonly iconoAlerta = AlertCircle;
  protected readonly iconoExito = CheckCircle2;

  protected readonly enviando = signal(false);
  protected readonly intentoEnvio = signal(false);
  protected readonly enviado = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
  });

  protected mostrarErrorCorreo(): boolean {
    return this.obtenerErrorCorreo() !== null;
  }

  protected obtenerErrorCorreo(): string | null {
    const control = this.formulario.controls.correo;
    if ((!control.touched && !this.intentoEnvio()) || !control.errors) {
      return null;
    }
    if (control.hasError('required')) {
      return 'El correo electrónico es obligatorio.';
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

    if (this.formulario.invalid || this.enviando()) {
      return;
    }

    this.enviando.set(true);
    this.autenticacionService.solicitarRecuperacion(this.formulario.getRawValue()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
      },
      error: (err) => {
        this.enviando.set(false);
        const errorApi = extraerErrorApi(err, 'No se pudo procesar la solicitud.');
        if (errorApi.codigo === 429 || errorApi.codigo === 400 || errorApi.codigo === 0) {
          this.errorMensaje.set(errorApi.mensaje);
          return;
        }
        this.enviado.set(true);
      },
    });
  }
}
