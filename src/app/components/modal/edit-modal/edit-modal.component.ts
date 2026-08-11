import {
  Component,
  effect,
  inject,
  input,
  model,
  output
} from '@angular/core';

import {
  FormBuilder,
  FormGroup, FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

@Component({
  standalone: true,
  selector: 'app-edit-modal',
  imports: [
    Button,
    Dialog,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-modal.component.html'
})
export class EditModalComponent {

  private readonly fb = inject(FormBuilder);

  titulo = input<string>('');
  max_nombre = input<string>('50');
  datos = input<any | null>(null);
  idInstalacion = input<string>('');
  isVisible = model<boolean>(false);
  guardar = output<any>();
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', Validators.required],
    descripcion: [''],
    activo: [true],
    visible: [null]
  });

  constructor() {
    effect(() => {
      if (!this.isVisible()) {
        return;
      }

      const datos = this.datos();

      this.form.reset();

      if (datos) {
        this.form.patchValue(datos);
      } else {
        this.form.reset({
          id: null,
          nombre: '',
          descripcion: '',
          activo: true,
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

    console.log(this.form.getRawValue());

    this.guardar.emit(this.form.getRawValue());
  }

  cerrarModal(): void {
    this.isVisible.set(false);
  }
}
