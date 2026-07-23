import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../services/dialog.service';
import { TooltipModule } from 'primeng/tooltip';

import { Conservacion } from '../../models/conservacion';
import { ConservacionService } from '../../services/conservacion.service';

@Component({
  selector: 'app-conservacion',
  imports: [TableModule, Button, InputText, ReactiveFormsModule, ConfirmDialogModule, TooltipModule],
  templateUrl: './conservacion.component.html',
  styleUrl: './conservacion.component.css',
})
export class ConservacionComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ConservacionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  conservaciones: Conservacion [] = [];
  cargando: boolean = true;

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: [''],
    descripcion: [''],
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
          this.conservaciones = response.data;
        } else {
          this.conservaciones = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando conservaciones:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las conservaciones' });
        this.cargando = false;
        this.conservaciones = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.conservaciones = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar conservaciones', err);
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

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const conservacione = this.conservaciones.find(p => p.id === id);
        if (conservacione) {
          conservacione.activo = !conservacione.activo;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(conservacion: Conservacion): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${conservacion.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(conservacion.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.conservaciones = this.conservaciones.filter(p => p.id !== id);
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
