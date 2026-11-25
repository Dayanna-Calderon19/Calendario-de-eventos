import { Component, input, output } from '@angular/core';

export type VarianteBoton = 'primario' | 'secundario' | 'peligroso';

@Component({
  selector: 'app-boton',
  standalone: true,
  template: `
    <button
      [type]="tipo()"
      [disabled]="deshabilitado() || cargando()"
      [class]="'boton boton-' + variante()"
      (click)="alPulsar.emit()"
    >
      <ng-content />
    </button>
  `,
  styles: `
    .boton {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radio-pequeno);
      border: 1px solid transparent;
      font-weight: 600;
      cursor: pointer;
      transition: background-color var(--transicion-base), opacity var(--transicion-base);
    }
    .boton:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .boton-primario {
      background-color: var(--color-primario);
      color: #ffffff;
    }
    .boton-primario:hover:not(:disabled) {
      background-color: var(--color-primario-hover);
    }
    .boton-secundario {
      background-color: var(--color-superficie);
      border-color: var(--color-borde);
      color: var(--color-texto);
    }
    .boton-secundario:hover:not(:disabled) {
      background-color: var(--color-superficie-secundaria);
    }
    .boton-peligroso {
      background-color: var(--color-peligro);
      color: #ffffff;
    }
  `
})
export class BotonComponent {
  readonly tipo = input<'button' | 'submit' | 'reset'>('button');
  readonly variante = input<VarianteBoton>('primario');
  readonly deshabilitado = input(false);
  readonly cargando = input(false);
  readonly alPulsar = output<void>();
}
