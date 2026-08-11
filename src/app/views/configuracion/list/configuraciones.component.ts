import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';
import { Conservacion } from '../../../models/conservacion';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { Configuracion } from '../../../models/configuracion';
import { ConfiguracionService } from '../../../services/configuracion.service';
import { Truncar } from '../../../pipe/trucar.pipe';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { mensajesUtil } from '../../../utils/mensajes.util';

/**
 * @version 1.0.0
 */

@Component({
  standalone: true,
  selector: 'app-parametros',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    Truncar,
    EditModalComponent
  ],
  templateUrl: './configuraciones.component.html'
})
export class ConfiguracionComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ConfiguracionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  configuracion: Configuracion | any = null;
  configuraciones: Configuracion [] = [];
  cargando: boolean = true;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', Validators.required],
    descripcion: [null],
    valor: [null, Validators.required],
    activo: [true, Validators.required]
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
          this.configuraciones = response.data;
        } else {
          this.configuraciones = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando configuración:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar configuración' });
        this.cargando = false;
        this.configuraciones = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.configuraciones = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar configuración', err);
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
        const configuracion = this.configuraciones.find(p => p.id === id);
        if (configuracion) {
          configuracion.activo = !configuracion.activo;
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

  confirmarBorrado(registro: Conservacion): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${registro.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(registro.id)
    });
  }

  private borrarRegistro(id: number): void {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.configuraciones = this.configuraciones.filter(p => p.id !== id);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Se ha borrado el registro correctamente'
        });
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al borrar el registro', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al borrar el registro' });
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirModal(): void {
    this.configuracion = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id).subscribe({
      next: (response: ApiResponseWrapper<Configuracion>) => {
        this.configuracion = response.data || [];

        console.log(this.configuracion);

        if (this.configuracion) {
          this.modalVisible = true;
        }
      },
      error: (err) => {
        console.error('Error al editar: ', err);
        mensajesUtil(this.messageService, 'error', 'carga');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar(configuracion: Configuracion) {
    this.cargando = true;

    const datos: Configuracion = {
      id: configuracion.id,
      nombre: configuracion.nombre,
      descripcion: configuracion.descripcion,
      valor: configuracion.valor,
      activo: configuracion.activo
    };

    if (datos.id) {
      this.service.updateRegistro(datos).subscribe({
        next: () => {

          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Registro actualizado correctamente'
          });

          this.modalVisible = false;
          this.cargando = false;

          this.cargar();
        },

        error: (err) => {
          console.error('Error al actualizar nivel energético', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el nivel energético'
          });

          this.cargando = false;
        }
      });
    } else {
      this.service.addRegistro(datos).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Añadido',
            detail: 'Registro añadido correctamente'
          });

          this.modalVisible = false;
          this.cargando = false;

          this.cargar();
        },

        error: (err) => {
          console.error('Error al añadir registro', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el registro'
          });

          this.cargando = false;
        }
      });
    }
  }

}
