import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Listbox } from 'primeng/listbox';
import { Fieldset } from 'primeng/fieldset';
import { MessageService } from 'primeng/api';
import { forkJoin, Observable, of } from 'rxjs';
import { RolService } from '../../../services/rol.service';
import { TipoRolService } from '../../../services/tipo-rol.service';
import { RolPermisoService } from '../../../services/rol-permiso.service';
import { Rol } from '../../../models/rol';
import { TipoRolModel } from '../../../models/tipo-rol-model';
import { RolPermisoModel } from '../../../models/rol-permiso-model';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { LoaderComponent } from '../../../layouts/loader/loader.component';

/**
 * @version 1.1.0
 */

@Component({
  standalone: true,
  selector: 'app-rol-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputText,
    Button,
    Listbox,
    Fieldset,
    LoaderComponent
  ],
  templateUrl: './rol-form.component.html'
})
export class RolFormComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RolService);
  private readonly tipoRolService = inject(TipoRolService);
  private readonly rolPermisoService = inject(RolPermisoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  idRol: number | null = null;
  cargando = false;
  guardando = false;

  permisosAsignados: RolPermisoModel[] = [];
  permisosDisponibles: TipoRolModel[] = [];
  permisosSeleccionados: TipoRolModel[] = [];
  permisosDisponiblesElegidos: TipoRolModel[] = [];
  permisosSeleccionadosElegidos: TipoRolModel[] = [];

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.maxLength(Rol.campos.nombre.maxLength)]],
    descripcion: [null],
    activo: [true]
  });

  get esEdicion(): boolean {
    return this.idRol !== null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.idRol = Number(id);
    }

    this.cargar();
  }

  private cargar(): void {
    this.cargando = true;

    forkJoin({
      rol: this.idRol ? this.service.rol(this.idRol) : of(null),
      tipos: this.tipoRolService.getAll(),
      asignados: this.idRol ? this.rolPermisoService.getAll({ idRol: this.idRol }) : of(null)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ rol, tipos, asignados }) => {
          if (rol?.data) {
            this.form.patchValue(rol.data);
          }

          this.permisosAsignados = asignados?.data || [];

          const todosTipos = tipos.data || [];
          const idsAsignados = new Set(this.permisosAsignados.map(p => p.tipoRol.id));

          this.permisosSeleccionados = todosTipos.filter(t => idsAsignados.has(t.id));
          this.permisosDisponibles = todosTipos.filter(t => !idsAsignados.has(t.id));

          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar el rol', err);
          mensajesUtil(this.messageService, 'error', 'carga');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  moverAseleccionados(): void {
    this.permisosSeleccionados = [...this.permisosSeleccionados, ...this.permisosDisponiblesElegidos];
    this.permisosDisponibles = this.permisosDisponibles.filter(p => !this.permisosDisponiblesElegidos.includes(p));
    this.permisosDisponiblesElegidos = [];
  }

  moverTodosASeleccionados(): void {
    this.permisosSeleccionados = [...this.permisosSeleccionados, ...this.permisosDisponibles];
    this.permisosDisponibles = [];
    this.permisosDisponiblesElegidos = [];
  }

  moverADisponibles(): void {
    this.permisosDisponibles = [...this.permisosDisponibles, ...this.permisosSeleccionadosElegidos];
    this.permisosSeleccionados = this.permisosSeleccionados.filter(p => !this.permisosSeleccionadosElegidos.includes(p));
    this.permisosSeleccionadosElegidos = [];
  }

  moverTodosADisponibles(): void {
    this.permisosDisponibles = [...this.permisosDisponibles, ...this.permisosSeleccionados];
    this.permisosSeleccionados = [];
    this.permisosSeleccionadosElegidos = [];
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rol = this.form.value;

    for (const campo in rol) {
      if (typeof rol[campo] === 'string' && !rol[campo].trim()) {
        rol[campo] = null;
      }
    }

    this.guardando = true;

    const peticion = this.esEdicion
      ? this.service.update(this.idRol as number, rol)
      : this.service.add(rol);

    peticion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.esEdicion) {
            this.guardarPermisos(this.idRol as number);
          } else {
            this.finalizarGuardado();
          }
        },
        error: (err) => {
          console.error('Error al guardar el rol', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.guardando = false;
          this.cdr.detectChanges();
        }
      });
  }

  private guardarPermisos(idRol: number): void {
    const idsAntes = new Set(this.permisosAsignados.map(p => p.tipoRol.id));
    const idsAhora = new Set(this.permisosSeleccionados.map(p => p.id));

    const aCrear = this.permisosSeleccionados.filter(t => !idsAntes.has(t.id));
    const aBorrar = this.permisosAsignados.filter(p => !idsAhora.has(p.tipoRol.id));

    const peticiones: Observable<any>[] = [
      ...aCrear.map(t => this.rolPermisoService.crear(idRol, t.id)),
      ...aBorrar.map(p => this.rolPermisoService.borrarRegistro(p.id))
    ];

    if (peticiones.length === 0) {
      this.finalizarGuardado();
      return;
    }

    forkJoin(peticiones)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.finalizarGuardado(),
        error: (err) => {
          console.error('Error al guardar los permisos del rol', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.guardando = false;
          this.cdr.detectChanges();
        }
      });
  }

  private finalizarGuardado(): void {
    mensajesUtil(this.messageService, 'success', this.esEdicion ? 'update' : 'add');
    this.guardando = false;
    this.router.navigate(['/roles']);
  }

  cancelar(): void {
    this.router.navigate(['/roles']);
  }

}
