import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { Opcion } from '../../interface/opcion.interface';

@Component({
  standalone: true,
  selector: 'app-modal',
  imports: [
    FormsModule,
    Button,
    Dialog
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  titulo = input<string>('');
  opciones = input<Opcion[]>([]);
  isVisible = model<boolean>(false);
  guardar = output<number>();
  seleccionado: number | null = null;

  seleccionar(valor: number | null): void {
    this.seleccionado = valor;
  }

  aceptar(): void {
    if (this.seleccionado === null) return;

    this.guardar.emit(this.seleccionado);
    this.seleccionado = null;
    this.isVisible.set(false);
  }

  cerrar(): void {
    this.seleccionado = null;
    this.isVisible.set(false);
  }
}
