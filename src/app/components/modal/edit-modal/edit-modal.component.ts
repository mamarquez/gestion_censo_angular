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
    ine?: number;
    codigo?: number;
    nombre?: number;
    valor?: number;
    mostrar?: number;
  }>({
    codigo: 3,
    nombre: 50,
    valor: 255,
    mostrar: 50
  })

  camposMostrar = input<{
    ine?: boolean;
    codigo?: boolean;
    cpro?: boolean;
    cmun?: boolean;
    dc?: boolean;
    nombre?: boolean;
    descripcion?: boolean;
    valor?: boolean;
    mostrar?: boolean;
    tipoGestor?: boolean;
    enlace?: boolean;
    activo?: boolean;
    visible?: boolean;
  }>({
    ine: false,
    codigo: false,
    cpro: false,
    cmun: false,
    dc: false,
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
    cpro: [null],
    cmun: [null],
    dc: [null],
    ine: [null],
    codigo: [null],
    nombre: ['', Validators.required],
    descripcion: [null],
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
          ine: '',
          cpro: '',
          cmun: '',
          dc: '',
          codigo: '',
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
