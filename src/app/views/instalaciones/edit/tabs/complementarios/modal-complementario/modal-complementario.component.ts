import { Component, EventEmitter, model, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { PrimeTemplate } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { SelectComplementariosComponent } from '../../../../../../components/select-complementario/select-complementarios.component';

@Component({
  standalone: true,
  selector: 'app-modal-complementario',
  imports: [
    Dialog,
    Button,
    PrimeTemplate,
    FormsModule,
    SelectComplementariosComponent
  ],
  templateUrl: './modal-complementario.component.html',
  styleUrl: './modal-complementario.component.css',
})
export class ModalComplementarioComponent {

  isVisible = model.required<boolean>();
  seleccionado: number | null = null;

  @Output() guardar = new EventEmitter<number>();

  aceptar(): void {
    if (!this.seleccionado) return;

    this.guardar.emit(this.seleccionado);
    this.seleccionado = null;
    this.isVisible.set(false);
  }

  cerrar(): void {
    this.seleccionado = null;
    this.isVisible.set(false);
  }
}
