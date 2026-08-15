import { ChangeDetectorRef, Component, DestroyRef, inject, model, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { Fluid } from 'primeng/fluid';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Listbox } from 'primeng/listbox';
import { RolService } from '../../../../../services/rol.service';
import { ProvinciaService } from '../../../../../services/provincia.service';
import { UsuarioService } from '../../../../../services/usuario.service';
import { UsuarioRolService } from '../../../../../services/usuariorol.service';
import { UsuarioProvinciaService } from '../../../../../services/usuarioprovincia.service';
import { MessageService } from 'primeng/api';
import { Rol } from '../../../../../models/rol';
import { Provincia } from '../../../../../models/provincia';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { ApiResponse } from '../../../../../models/apiresponse';
import { UsuarioModel } from '../../../../../models/usuario-model';
import { mensajesUtil } from '../../../../../utils/mensajes.util';
import { LoaderComponent } from '../../../../../layouts/loader/loader.component';
import { forkJoin } from 'rxjs';

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
  private readonly usuarioProvinciaService = inject(UsuarioProvinciaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  idUsuario = model.required<string>();
  roles: Rol[] = [];
  rolesUsuario: number[] = [];
  todasLasProvincias: Provincia[] = [];
  provinciasDisponibles: Provincia[] = [];
  provinciasSeleccionadas: Provincia[] = [];
  provinciasDisponiblesElegidas: Provincia[] = [];
  provinciasSeleccionadasElegidas: Provincia[] = [];
  cargandoRoles = false;
  cargandoProvincias = false;
  guardando = false;
  rolesCargados = false;
  provinciasCargadas = false;

  form: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.cargarRolesUsuario();
    this.cargarRoles();
    this.cargarProvincias();
  }

  private cargarRolesUsuario(): void {
    this.usuarioService.get(this.idUsuario())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.rolService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    forkJoin({
      provincias: this.provinciaService.getAll({ activo: true }),
      asignadas: this.usuarioProvinciaService.getByUsuario(Number(this.idUsuario()))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: ({ provincias, asignadas }) => {
        this.todasLasProvincias = provincias.data || [];

        const idsAsignados = new Set((asignadas.data || []).map(a => a.provinciaId));

        this.provinciasSeleccionadas = this.todasLasProvincias.filter(p => idsAsignados.has(p.id));
        this.provinciasDisponibles = this.todasLasProvincias.filter(p => !idsAsignados.has(p.id));

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

  moverAseleccionadas(): void {
    this.provinciasSeleccionadas = [...this.provinciasSeleccionadas, ...this.provinciasDisponiblesElegidas];
    this.provinciasDisponibles = this.provinciasDisponibles.filter(p => !this.provinciasDisponiblesElegidas.includes(p));
    this.provinciasDisponiblesElegidas = [];
  }

  moverTodasASeleccionadas(): void {
    this.provinciasSeleccionadas = [...this.provinciasSeleccionadas, ...this.provinciasDisponibles];
    this.provinciasDisponibles = [];
    this.provinciasDisponiblesElegidas = [];
  }

  moverADisponibles(): void {
    this.provinciasDisponibles = [...this.provinciasDisponibles, ...this.provinciasSeleccionadasElegidas];
    this.provinciasSeleccionadas = this.provinciasSeleccionadas.filter(p => !this.provinciasSeleccionadasElegidas.includes(p));
    this.provinciasSeleccionadasElegidas = [];
  }

  moverTodasADisponibles(): void {
    this.provinciasDisponibles = [...this.provinciasDisponibles, ...this.provinciasSeleccionadas];
    this.provinciasSeleccionadas = [];
    this.provinciasSeleccionadasElegidas = [];
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
    if (this.provinciasSeleccionadas.length === 0) {
      mensajesUtil(this.messageService, 'error', 'error');
      return;
    }

    this.guardando = true;

    const idUsuario = Number(this.idUsuario());
    const provinciaIds = this.provinciasSeleccionadas.map(p => p.id);

    forkJoin({
      roles: this.usuarioRolService.asignarRoles(idUsuario, this.rolesUsuario),
      provincias: this.usuarioProvinciaService.asignarProvincias(idUsuario, provinciaIds)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        mensajesUtil(this.messageService, 'success', 'update');
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al guardar los roles/provincias', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
