import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { UsuarioModel } from '../../../models/usuario-model';
import { UsuarioService } from '../../../services/usuario.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { FilasAutoajustablesDirective, opcionesFilasPorPagina } from '../../../utils/filas-autoajustables.directive';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-usuario',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    Tag,
    AccionesTablaComponent,
    FilasAutoajustablesDirective
  ],
  templateUrl: './usuario.component.html'
})
export class UsuarioComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuarioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  usuarios: UsuarioModel [] = [];
  cargando: boolean = true;
  filasPorPagina = 20;

  get opcionesFilasPorPagina(): number[] {
    return opcionesFilasPorPagina(this.filasPorPagina);
  }

  ngOnInit(): void {
    this.cargar();
  }

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: [''],
    apellido1: [''],
    apellido2: [''],
    activo: [true]
  });

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
          this.usuarios = response.data;
        } else {
          this.usuarios = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando provincias:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.usuarios = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.usuarios = response.data || [];
        console.log(this.usuarios);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar menús', err);
        mensajesUtil(this.messageService, 'error', 'carga');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: string): void {
    this.cargando = true;

    this.service.cambiarEstado(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        const usuario = this.usuarios.find(p => p.id === id);
        if (usuario) {
          usuario.activo = !usuario.activo;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado del menu', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  nuevo(): void {
    this.router.navigate(['/usuarios', 'nuevo']);
  }

  editar(id: string): void {
    this.router.navigate(['/usuarios', id]);
  }

  confirmarBorrado(registro: UsuarioModel): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${registro.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(registro.id)
    });
  }

  private borrarRegistro(id: string): void {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(p => p.id !== id);
        mensajesUtil(this.messageService, 'success', 'delete');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar el registro', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    this.cargando = false;
  }

}
