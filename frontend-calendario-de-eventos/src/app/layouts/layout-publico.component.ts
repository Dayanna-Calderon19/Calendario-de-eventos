import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-publico',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="contenedor-publico">
      <section class="tarjeta panel-autenticacion">
        <router-outlet />
      </section>
    </main>
  `,
  styles: `
    .contenedor-publico {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      background-color: var(--color-fondo);
    }
    .panel-autenticacion {
      width: 100%;
      max-width: 440px;
      box-shadow: var(--sombra-panel);
      padding: 2rem;
    }
  `
})
export class LayoutPublicoComponent {}
