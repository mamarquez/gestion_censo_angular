import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../../services/dialog.service';

import { TipoGestorPropiedadService } from '../../../services/tipogestorpropiedad.service';
import { TipoGestorPropiedad } from '../../../models/tipogestorpropiedad';

@Component({
  standalone: true,
  selector: 'app-tipos-gestores-propiedades',
  imports: [TableModule, Button, InputText, ReactiveFormsModule, ConfirmDialogModule],
  templateUrl: './tiposgestorespropiedades.component.html',
  styleUrl: './tiposgestorespropiedades.component.css',
})
export class TiposGestoresPropiedadesComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TipoGestorPropiedadService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  tiposGestoresPropiedades: TipoGestorPropiedad [] = [];
  cargando: boolean = true;

  form: FormGroup = this.fb.group({
    nombre: [''],
    mostrar: [''],
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
          this.tiposGestoresPropiedades = response.data;
        } else {
          this.tiposGestoresPropiedades = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando tipos gestores propiedades:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los tipos gestores propiedades' });
        this.cargando = false;
        this.tiposGestoresPropiedades = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.tiposGestoresPropiedades = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tipos de gestores de propiedades', err);
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
        const tipoGestorPropiedad = this.tiposGestoresPropiedades.find(p => p.id === id);
        if (tipoGestorPropiedad) {
          tipoGestorPropiedad.activo = !tipoGestorPropiedad.activo;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de los tipos gestores propiedades', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(tipoGestorPropiedad: TipoGestorPropiedad): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${tipoGestorPropiedad.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(tipoGestorPropiedad.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.tiposGestoresPropiedades = this.tiposGestoresPropiedades.filter(p => p.id !== id);
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Se ha borrado el registro correctamente' });
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
