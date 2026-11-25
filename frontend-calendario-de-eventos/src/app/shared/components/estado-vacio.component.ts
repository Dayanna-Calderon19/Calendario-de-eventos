import { Component, input } from '@angular/core';

@Component({
  selector: 'app-estado-vacio',
  standalone: true,
  template: `
    <div class="estado-vacio tarjeta">
      <h3>{{ titulo() }}</h3>
      <p class="texto-secundario">{{ descripcion() }}</p>
      <ng-content />
    </div>
  `,
  styles: `
    .estado-vacio {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      padding: 2rem 1.5rem;
    }
  `
})
export class EstadoVacioComponent {
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
}
