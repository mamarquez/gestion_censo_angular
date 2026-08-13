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
  datos = input<any | null>(null);
  idInstalacion = input<string>('');
  isVisible = model<boolean>(false);

  maxValores = input<{
    nombre?: number;
    valor?: number;
    mostrar?: number;
  }>({
    nombre: 50,
    valor: 255,
    mostrar: 50
  })

  camposMostrar = input<{
    nombre?: boolean;
    descripcion?: boolean;
    valor?: boolean;
    mostrar?: boolean;
    tipoGestor?: boolean;
    enlace?: boolean;
    activo?: boolean;
    visible?: boolean;
  }>({
    nombre: true,
    descripcion: true,
    valor: false,
    mostrar: false,
    tipoGestor: false,
    enlace: false,
    activo: true,
    visible: false
  });

  guardar = output<any>();
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', Validators.required],
    descripcion: [''],
    valor: [null],
    mostrar: [null],
    enlace: [null],
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
          valor: '',
          enlace: '',
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

    this.guardar.emit(this.form.getRawValue());
  }

  cerrarModal(): void {
    this.isVisible.set(false);
  }
}
