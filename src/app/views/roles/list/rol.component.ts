import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../../services/dialog.service';
import { Rol } from '../../../models/rol';
import { RolService } from '../../../services/rol.service';
import { RolPermisoService } from '../../../services/rol-permiso.service';
import { RolPermisoModel } from '../../../models/rol-permiso-model';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { ModalRolPermisoComponent } from '../../../components/rol/modal-rol-permiso/modal-rol-permiso.component';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { Truncar } from '../../../pipe/trucar.pipe';
import { FilasAutoajustablesDirective, opcionesFilasPorPagina } from '../../../utils/filas-autoajustables.directive';

/**
 * @version 1.0.0
 */

@Component({
  standalone: true,
  selector: 'app-rol',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    AccionesTablaComponent,
    ModalRolPermisoComponent,
    Truncar,
    FilasAutoajustablesDirective
  ],
  templateUrl: './rol.component.html'
})
export class RolComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RolService);
  private readonly rolPermisoService = inject(RolPermisoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  roles: Rol [] = [];
  cargando: boolean = true;
  filasExpandidas: Record<number, boolean> = {};
  permisosPorRol: Record<number, RolPermisoModel[]> = {};
  cargandoPermisos: Record<number, boolean> = {};
  modalVisible = false;
  rolSeleccionado: Rol | null = null;
  filasPorPagina = 10;

  get opcionesFilasPorPagina(): number[] {
    return opcionesFilasPorPagina(this.filasPorPagina);
  }

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(Rol.campos.nombre.maxLength)]],
    descripcion: [null],
    activo: [null]
  });

  ngOnInit(): void {
    this.cargar();
  }

  limpiar(): void {
    this.form.reset();
    this.buscar();
  }

  buscar(): void {
    const filtros = this.form.value;
    this.cargando = true;

    this.service.getAll(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.roles = response.data;
        } else {
          this.roles = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando roles:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.roles = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.roles = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar roles', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): void {
    this.cargando = true;

    this.service.cambiarEstado(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        const rol = this.roles.find(p => p.id === id);
        if (rol) {
          rol.activo = !rol.activo;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado del rol', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(rol: Rol): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${rol.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(rol.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.roles = this.roles.filter(p => p.id !== id);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Se ha borrado el registro correctamente'
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar el registro', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al borrar el registro' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    this.cargando = false;
  }

  toggleFila(rol: Rol): void {
    const yaExpandida = !!this.filasExpandidas[rol.id];

    this.filasExpandidas = {
      ...this.filasExpandidas,
      [rol.id]: !yaExpandida
    };

    if (!yaExpandida && !this.permisosPorRol[rol.id]) {
      this.cargarPermisos(rol.id);
    }

    this.cdr.detectChanges();
  }

  private cargarPermisos(idRol: number): void {
    this.cargandoPermisos[idRol] = true;

    this.rolPermisoService.getAll({ idRol })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<RolPermisoModel[]>) => {
        this.permisosPorRol[idRol] = response.data || [];
        this.cargandoPermisos[idRol] = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los permisos del rol', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.permisosPorRol[idRol] = [];
        this.cargandoPermisos[idRol] = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalPermiso(rol: Rol): void {
    this.rolSeleccionado = rol;
    this.modalVisible = true;
  }

  nuevoRol(): void {
    this.router.navigate(['/roles/nuevo']);
  }

  editar(id: number): void {
    this.router.navigate(['/roles', id]);
  }

  idsTipoRolAsignados(idRol: number): number[] {
    return (this.permisosPorRol[idRol] || []).map(p => p.idTipoRol);
  }

  permisoGuardado(idRol: number): void {
    this.cargarPermisos(idRol);
  }

  confirmarBorradoPermiso(idRol: number, permiso: RolPermisoModel): void {
    if (idRol !== 1) {
      this.dialog.confirmar({
        mensaje: `¿Deseas eliminar el permiso "<strong>${permiso.nombreTipoRol}</strong>"?`,
        titulo: 'Confirmar eliminación',
        labelAceptar: 'Sí, eliminar',
        onAccept: () => this.borrarPermiso(idRol, permiso.id)
      });
    }
  }

  private borrarPermiso(idRol: number, idPermiso: number): void {
    this.rolPermisoService.borrarRegistro(idPermiso)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.permisosPorRol[idRol] = (this.permisosPorRol[idRol] || []).filter(p => p.id !== idPermiso);
        mensajesUtil(this.messageService, 'success', 'delete');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar el permiso', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cdr.detectChanges();
      }
    });
  }

}
