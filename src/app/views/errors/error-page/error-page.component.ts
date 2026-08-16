import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-error-page',
  imports: [RouterLink, Button],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.css'
})
export class ErrorPageComponent {

  codigo = input.required<string>();
  titulo = input.required<string>();
  mensaje = input.required<string>();
  icono = input<string>('pi pi-exclamation-triangle');
  mostrarVolverAtras = input<boolean>(true);
  enlaceInicio = input<string>('/instalaciones');
  textoBotonInicio = input<string>('Ir al inicio');

  volverAtras(): void {
    window.history.back();
  }

}
