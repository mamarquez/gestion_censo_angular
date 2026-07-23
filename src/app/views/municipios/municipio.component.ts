import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../services/dialog.service';

import { Municipio } from '../../models/municipio';
import { MunicipioService } from '../../services/municipio.service';

@Component({
  selector: 'app-municipio',
  standalone: true,
  imports: [TableModule, Button, InputText, ReactiveFormsModule, ConfirmDialogModule],
  templateUrl: './municipio.component.html',
  styleUrl: './municipio.component.css',
})
export class MunicipioComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MunicipioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  municipios: Municipio[] = [];
  cargando: boolean = true;

  form: FormGroup = this.fb.group({
    cpro: [''],
    cmun: [''],
    dc: [''],
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
          this.municipios = response.data;
        } else {
          this.municipios = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando provincias:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los municipios' });
        this.cargando = false;
        this.municipios = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.municipios = response.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar municipios', err);
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
        const provincia = this.municipios.find(p => p.id === id);
        if (provincia) {
          provincia.activo = !provincia.activo;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de la provincia', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(municipio: Municipio): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${municipio.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(municipio.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    /*
    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.provincias = this.provincias.filter(p => p.id !== id);

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
    */
    this.cargando = false;
  }
}
