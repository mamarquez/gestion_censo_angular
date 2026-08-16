import { ChangeDetectorRef, Component, DestroyRef, inject, model, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { Fluid } from 'primeng/fluid';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { UsuarioService } from '../../../../../services/usuario.service';
import { MessageService } from 'primeng/api';
import { ApiResponse } from '../../../../../models/apiresponse';
import { UsuarioModel } from '../../../../../models/usuario-model';
import { mensajesUtil } from '../../../../../utils/mensajes.util';
import { Router } from '@angular/router';

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

  private readonly router = inject(Router);
  private readonly service = inject(UsuarioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  idUsuario = model<string>('');

  get esEdicion(): boolean {
    return !!this.idUsuario();
  }

  cargando = true;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombreUsuario: ['', Validators.required],
    password: [null],
    nombre: [null, Validators.required],
    apellido1: [null, Validators.required],
    apellido2: [null],
    email: [null, [Validators.required, Validators.email]],
    descripcion: [null],
    activo: [true]
  });

  ngOnInit(): void {
    if (this.esEdicion) {
      this.form.get('password')?.clearValidators();
      this.cargarDatos(this.idUsuario());
    } else {
      this.form.get('password')?.setValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  private cargarDatos(id: string): void {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponse<UsuarioModel>) => {
        const usuario = response.data ?? null;

        if (usuario) {
          this.form.patchValue(usuario);
        }

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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    const datos = { ...this.form.value };

    for (const campo in datos) {
      if (typeof datos[campo] === 'string' && !datos[campo].trim()) {
        datos[campo] = null;
      }
    }

    if (this.esEdicion) {
      this.actualizar(datos);
    } else {
      this.crear(datos);
    }
  }

  private crear(datos: Partial<UsuarioModel>): void {
    this.service.add(datos)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        mensajesUtil(this.messageService, 'success', 'add');
        this.guardando = false;
        this.cdr.detectChanges();
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        console.error('Error al crear usuario', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private actualizar(datos: Partial<UsuarioModel>): void {
    delete datos.password;

    this.service.update(this.idUsuario(), datos)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        mensajesUtil(this.messageService, 'success', 'update');
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al guardar usuario', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelar() {
    this.router.navigate(['/usuarios']);
  }

}
