import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../services/dialog.service';
import { TooltipModule } from 'primeng/tooltip';

import { Gestor } from '../../models/gestor';
import { GestorService } from '../../services/gestor.service';

@Component({
  selector: 'app-gestor',
  imports: [TableModule, Button, InputText, ReactiveFormsModule, ConfirmDialogModule, TooltipModule],
  templateUrl: './gestor.component.html',
  styleUrl: './gestor.component.css',
})
export class GestorComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(GestorService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  gestores: Gestor [] = [];
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
          this.gestores = response.data;
        } else {
          this.gestores = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando provincias:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los gestores'
        });
        this.cargando = false;
        this.gestores = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.gestores = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar gestores', err);
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
        const gestor = this.gestores.find(p => p.id === id);
        if (gestor) {
          gestor.activo = !gestor.activo;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de gestor', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(gestor: Gestor): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${gestor.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(gestor.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.gestores = this.gestores.filter(p => p.id !== id);
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
