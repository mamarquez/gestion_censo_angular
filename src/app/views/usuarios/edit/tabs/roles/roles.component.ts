import { ChangeDetectorRef, Component, inject, model, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { Fluid } from 'primeng/fluid';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Listbox } from 'primeng/listbox';
import { RolService } from '../../../../../services/rol.service';
import { ProvinciaService } from '../../../../../services/provincia.service';
import { UsuarioService } from '../../../../../services/usuario.service';
import { UsuarioRolService } from '../../../../../services/usuariorol.service';
import { MessageService } from 'primeng/api';
import { Rol } from '../../../../../models/rol';
import { Provincia } from '../../../../../models/provincia';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { ApiResponse } from '../../../../../models/apiresponse';
import { UsuarioModel } from '../../../../../models/usuario-model';
import { mensajesUtil } from '../../../../../utils/mensajes.util';
import { LoaderComponent } from '../../../../../layouts/loader/loader.component';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-roles',
  imports: [
    Button,
    Fieldset,
    Fluid,
    FormsModule,
    Listbox,
    ReactiveFormsModule,
    LoaderComponent
  ],
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {

  private readonly rolService = inject(RolService);
  private readonly provinciaService = inject(ProvinciaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly usuarioRolService = inject(UsuarioRolService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  idUsuario = model.required<string>();
  roles: Rol[] = [];
  rolesUsuario: number[] = [];
  provincias: Provincia[] = [];
  provinciasUsuario: number[] = [];
  cargandoRoles = false;
  cargandoProvincias = false;
  guardando = false;
  rolesCargados = false;
  provinciasCargadas = false;

  form: FormGroup = this.fb.group({
    provinciasUsuario: [[]]
  });

  ngOnInit(): void {
    this.cargarRolesUsuario();
    this.cargarRoles();
    this.cargarProvincias();
  }

  private cargarRolesUsuario(): void {
    this.usuarioService.get(this.idUsuario()).subscribe({
      next: (response: ApiResponse<UsuarioModel>) => {
        const usuario = response.data ?? null;
        this.rolesUsuario = (usuario?.roles ?? []).map(rol => rol.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los roles del usuario', err);
      }
    });
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

  private cargarProvincias(): void {
    this.cargandoProvincias = true;

    this.provinciaService.getAll({ activo: true }).subscribe({
      next: (respose: ApiResponseWrapper<Provincia[]>) => {
        this.provincias = respose.data || [];
        this.provinciasCargadas = true;
        this.cargandoProvincias = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando provincias ', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargandoProvincias = false;
        this.cdr.detectChanges();
      }
    });
  }

  tieneRol(rolId: number): boolean {
    return this.rolesUsuario.includes(rolId);
  }

  toggleRol(rolId: number): void {
    if (rolId === 1) {
      if (this.tieneRol(1)) {
        // Desactivar Administrador
        this.rolesUsuario = [];
      } else {
        // Activar Administrador y quitar todos los demás
        this.rolesUsuario = [rolId];
      }

      return;
    }

    if (this.tieneRol(1)) {
      return;
    }

    this.rolesUsuario = this.tieneRol(rolId)
      ? this.rolesUsuario.filter(id => id !== rolId)
      : [...this.rolesUsuario, rolId];
  }

  guardar(): void {
    this.guardando = true;

    this.usuarioRolService.asignarRoles(Number(this.idUsuario()), this.rolesUsuario).subscribe({
      next: () => {
        mensajesUtil(this.messageService, 'success', 'update');
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al guardar los roles', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
