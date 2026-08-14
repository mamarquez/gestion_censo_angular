import { ChangeDetectorRef, Component, inject, model, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { Fluid } from 'primeng/fluid';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { UsuarioService } from '../../../../../services/usuario.service';
import { MessageService } from 'primeng/api';
import { ApiResponse } from '../../../../../models/apiresponse';
import { UsuarioModel } from '../../../../../models/usuario-model';

@Component({
  standalone: true,
  selector: 'app-datos',
  imports: [
    Button,
    Fieldset,
    Fluid,
    FormsModule,
    InputText,
    ReactiveFormsModule
  ],
  templateUrl: './datos.component.html'
})
export class DatosComponent implements OnInit {

  private readonly service = inject(UsuarioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  idUsuario = model.required<string>();

  cargando = true;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombreUsuario: ['', Validators.required],
    nombre: [null, Validators.required],
    apellido1: [null, Validators.required],
    apellido2: [null],
    email: [null, [Validators.required, Validators.email]],
    descripcion: [null],
    activo: [true]
  });

  ngOnInit(): void {
    if (this.idUsuario()) {
      this.idUsuario.set(this.idUsuario());
      this.cargarDatos(this.idUsuario());
    } else {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  private cargarDatos(id: string): void {
    this.service.get(id).subscribe({
      next: (response: ApiResponse<UsuarioModel>) => {
        const usuario = response.data ?? null;

        if (usuario) {
          this.form.patchValue(usuario);
          // this.rolesUsuario = (usuario.roles ?? []).map(r => r.id);
        }

        // this.cargarRoles();
        // this.cargarProvincias();

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuario', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el usuario' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar(): void {
    if (this.form.invalid || !this.idUsuario()) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    const datos = {
      ...this.form.value
      // roles: this.rolesUsuario.map(id => ({ id }))
    };

    this.service.update(this.idUsuario(), datos).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se han guardado los cambios' });
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al guardar usuario', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar los cambios' });
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
