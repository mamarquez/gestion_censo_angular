import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Usuario } from '../../models/usuario';
import { Rol } from '../../models/rol';
import { ApiResponse } from '../../models/apiresponse';
import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';

@Component({
  standalone: true,
  selector: 'app-edit-usuario',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: 'edit.component.html',
  styleUrl: 'edit.component.css'
})
export class EditUsuarioComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  private id: string | null = null;

  cargando = true;
  guardando = false;

  tabActiva: 'datos' | 'roles' = 'datos';

  roles: Rol[] = [];
  rolesUsuario: number[] = [];
  cargandoRoles = false;
  rolesCargados = false;

  form: FormGroup = this.fb.group({
    id: [''],
    username: ['', Validators.required],
    nombre: ['', Validators.required],
    apellido1: ['', Validators.required],
    apellido2: [''],
    email: ['', [Validators.required, Validators.email]],
    descripcion: [''],
    activo: [true]
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.cargarDatos(this.id);
    } else {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  private cargarDatos(id: string): void {
    this.service.get(id).subscribe({
      next: (response: ApiResponse<Usuario>) => {
        const usuario = response.data ?? null;

        if (usuario) {
          this.form.patchValue(usuario);
          this.rolesUsuario = (usuario.roles ?? []).map(r => r.id);
        }

        this.cargarRoles();

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

  seleccionarTab(tab: 'datos' | 'roles'): void {
    this.tabActiva = tab;
  }

  private cargarRoles(): void {
    this.cargandoRoles = true;

    this.rolService.getAll().subscribe({
      next: (response) => {
        this.roles = response.data || [];
        this.rolesCargados = true;
        this.cargandoRoles = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar roles', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los roles' });
        this.cargandoRoles = false;
        this.cdr.detectChanges();
      }
    });
  }

  tieneRol(rolId: number): boolean {
    return this.rolesUsuario.includes(rolId);
  }

  toggleRol(rolId: number): void {
    this.rolesUsuario = this.tieneRol(rolId)
      ? this.rolesUsuario.filter(id => id !== rolId)
      : [...this.rolesUsuario, rolId];
  }

  guardar(): void {
    if (this.form.invalid || !this.id) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    const datos = {
      ...this.form.value,
      roles: this.rolesUsuario.map(id => ({ id }))
    };

    this.service.update(this.id, datos).subscribe({
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
