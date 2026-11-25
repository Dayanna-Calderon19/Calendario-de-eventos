import { Component, input } from '@angular/core';

@Component({
  selector: 'app-cargando',
  standalone: true,
  template: `
    <div class="cargando" role="status" aria-live="polite">
      <span class="indicador"></span>
      <span>{{ mensaje() }}</span>
    </div>
  `,
  styles: `
    .cargando {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.5rem;
      color: var(--color-texto-secundario);
    }
    .indicador {
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid var(--color-borde);
      border-top-color: var(--color-primario);
      border-radius: 50%;
      animation: girar 0.8s linear infinite;
    }
    @keyframes girar {
      to {
        transform: rotate(360deg);
      }
    }
  `
})
export class CargandoComponent {
  readonly mensaje = input('Cargando información...');
}
