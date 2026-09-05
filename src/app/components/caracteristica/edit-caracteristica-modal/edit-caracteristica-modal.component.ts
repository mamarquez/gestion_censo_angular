import { Component, effect, inject, input, model, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InstalacionCaracteristica } from '../../../models/instalacionCaracteristica';
import { SelectCaracteristicaComponent } from '../../select-caracteristica/select-caracteristica.component';
import { SelectMedidaComponent } from '../../select-medida/select-medida.component';

@Component({
  standalone: true,
  selector: 'app-edit-caracteristica-modal',
  imports: [
    Button,
    Dialog,
    ReactiveFormsModule,
    InputText,
    SelectCaracteristicaComponent,
    SelectMedidaComponent
  ],
  templateUrl: './edit-caracteristica-modal.component.html'
})
export class EditCaracteristicaModalComponent {

  private readonly fb = inject(FormBuilder);

  datos = input<InstalacionCaracteristica | null>(null);
  isVisible = model<boolean>(false);

  guardar = output<InstalacionCaracteristica>();
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [null],
    caracteristica: [null, Validators.required],
    medida: [null],
    valor: [null, Validators.required],
    visible: [true]
  });

  constructor() {
    effect(() => {
      if (!this.isVisible()) {
        return;
      }

      const datos = this.datos();

      if (datos) {
        this.form.reset({
          id: datos.id,
          caracteristica: datos.caracteristica?.id ?? null,
          medida: datos.medida?.id ?? null,
          valor: datos.valor,
          visible: datos.visible
        });
      } else {
        this.form.reset({
          id: null,
          caracteristica: null,
          medida: null,
          valor: null,
          visible: true
        });
      }
    });
  }

  guardarModal(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();

    this.guardar.emit({
      id: valores.id,
      caracteristica: { id: valores.caracteristica },
      medida: valores.medida ? { id: valores.medida } : null,
      valor: valores.valor,
      visible: valores.visible
    } as InstalacionCaracteristica);
  }

  cerrarModal(): void {
    this.isVisible.set(false);
  }
}
