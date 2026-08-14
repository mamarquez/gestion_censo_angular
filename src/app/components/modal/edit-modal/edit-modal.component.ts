import { Component, effect, inject, input, model, output } from '@angular/core';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { SelectTiposGestoresComponent } from '../../select-tipo-gestor/select-complementarios.component';

@Component({
  standalone: true,
  selector: 'app-edit-modal',
  imports: [
    Button,
    Dialog,
    FormsModule,
    ReactiveFormsModule,
    InputText,
    SelectTiposGestoresComponent
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
  });

  camposMostrar = input<{
    id?: boolean;
    idInstalacion?: boolean;
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
    numero?: boolean;
    contacto?: boolean;
    notas?: boolean;
    tiposGestores?: boolean;
  }>({
    id: false,
    idInstalacion: false,
    ine: false,
    codigo: false,
    cpro: false,
    cmun: false,
    dc: false,
    nombre: true,
    descripcion: false,
    valor: false,
    mostrar: false,
    tipoGestor: false,
    enlace: false,
    activo: true,
    visible: false,
    numero: false,
    contacto: false,
    notas: false,
    tiposGestores: false
  });

  camposReadOnly = input<{
    nombre?: boolean,
  }>({
    nombre: false,
  });

  guardar = output<any>();
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [null],
    idInstalacion: [null],
    cpro: [null],
    cmun: [null],
    dc: [null],
    ine: [null],
    codigo: [null],
    nombre: [null],
    descripcion: [null],
    valor: [null],
    mostrar: [null],
    enlace: [null],
    activo: [true],
    visible: [null],
    numero: [null],
    contacto: [null],
    notas: [null],
    tipoGestor: [null]
  });

  constructor() {
    effect(() => {
      if (!this.isVisible()) {
        return;
      }

      const datos = this.datos();

      this.form.reset();

      if (datos) {
        this.form.patchValue({
          ...datos,
          tipoGestor: datos.tipoGestor?.id ?? null
        });
      } else {
        this.form.reset({
          id: null,
          ine: null,
          cpro: null,
          cmun: null,
          dc: null,
          codigo: null,
          nombre: null,
          descripcion: null,
          valor: null,
          enlace: null,
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

    const valores = this.form.getRawValue();

    for (const campo of Object.keys(valores)) {
      if (valores[campo] === '') {
        valores[campo] = null;
      }
    }

    this.guardar.emit(valores);
  }

  cerrarModal(): void {
    this.isVisible.set(false);
  }
}
