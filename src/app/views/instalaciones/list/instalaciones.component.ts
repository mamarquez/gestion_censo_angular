import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

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

@Component({
  standalone: true,
  selector: 'app-instalaciones',
  imports: [TableModule, Button, InputText, ReactiveFormsModule, ConfirmDialogModule, TooltipModule, AccionesTablaComponent],
  templateUrl: './instalaciones.component.html'
})
export class ListInstalacionesComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  instalaciones: Instalacion [] = [];
  cargando: boolean = true;

  form: FormGroup = this.fb.group({
    id: [''],
    codigo: [''],
    nombre: [''],
    activo: ['']
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

    this.service.getAll(filtros).subscribe({
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
        console.error('Error cargando instalación:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las instalaciones' });
        this.cargando = false;
        this.instalaciones = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.instalaciones = response.data || [];
        console.log(this.instalaciones);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar instalaciones', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Cambia la visibilidad de un registro
   * @param id Id del registro
   */
  cambiarVisible(id: number) {

  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): void {
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const instalacion = this.instalaciones.find(p => p.id === id);
        if (instalacion) {
          instalacion.visible = !instalacion.visible;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de la instalaciones', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
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

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.instalaciones = this.instalaciones.filter(p => p.id !== id);
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

}
