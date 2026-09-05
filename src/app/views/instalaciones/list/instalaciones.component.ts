import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Instalacion } from '../../../models/instalacion';
import { InstalacionService } from '../../../services/instalacion.service';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { SelectProvinciaComponent } from '../../../components/select-provincia/select-provincia.component';
import { SelectMunicipioComponent } from '../../../components/select-municipio/select-provincia.component';
import { Fieldset } from "primeng/fieldset";
import { FilasAutoajustablesDirective, opcionesFilasPorPagina } from '../../../utils/filas-autoajustables.directive';

/**
 * @version 1.0.2
 */

@Component({
  standalone: true,
  selector: 'app-instalaciones',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    AccionesTablaComponent,
    SelectProvinciaComponent,
    SelectMunicipioComponent,
    Fieldset,
    FilasAutoajustablesDirective
],
  templateUrl: './instalaciones.component.html'
})
export class ListInstalacionesComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  instalaciones: Instalacion [] = [];
  cargando: boolean = true;
  filasPorPagina = 10;

  get opcionesFilasPorPagina(): number[] {
    return opcionesFilasPorPagina(this.filasPorPagina);
  }

  form: FormGroup = this.fb.group({
    id: [null],
    codigo: [''],
    nombre: [''],
    provincia: [null],
    municipio: [null],
    activo: [true]
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
          this.instalaciones = response.data;
        } else {
          this.instalaciones = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.instalaciones = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.instalaciones = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  editar(id: string): void {
    this.router.navigate(['/instalaciones', id]);
  }

  /**
   * Cambia la visibilidad de un registro
   * @param id Id del registro
   */
  cambiarVisible(id: number): void {
    this.cargando = true;

    this.service.cambiarVisible(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        const instalacion = this.instalaciones.find(p => p.id === id);
        if (instalacion) {
          instalacion.visible = !instalacion.visible;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar la visibilidad', err);
        mensajesUtil(this.messageService, 'error', 'error');
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
        const instalacion = this.instalaciones.find(p => p.id === id);
        if (instalacion) {
          instalacion.baja = !instalacion.baja;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(instalacion: Instalacion): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${instalacion.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(instalacion.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.instalaciones = this.instalaciones.filter(p => p.id !== id);
        mensajesUtil(this.messageService, 'success', 'delete');
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

}
