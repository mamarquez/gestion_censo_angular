import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { NivelEducativo } from '../../../models/niveleducativo';
import { NivelEducativoService } from '../../../services/niveleducativo.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { NivelEnergetico } from '../../../models/nivelenergetico';

/**
 * @version 1.0.0
 */

@Component({
  standalone: true,
  selector: 'app-nivel-educativo',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    EditModalComponent
  ],
  templateUrl: './niveleducativo.component.html'
})
export class NivelEducativoComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(NivelEducativoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  nivelEducativo: NivelEducativo | any = null;
  nivelesEducativos: NivelEducativo [] = [];
  cargando: boolean = true;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: ['', Validators.required],
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
          this.nivelesEducativos = response.data;
        } else {
          this.nivelesEducativos = [];
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
        this.nivelesEducativos = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.nivelesEducativos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar niveles educativos', err);
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
        const niveleEducativo = this.nivelesEducativos.find(p => p.id === id);
        if (niveleEducativo) {
          niveleEducativo.activo = !niveleEducativo.activo;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de nivel energético', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(nivelEnergetico: NivelEducativo): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${nivelEnergetico.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(nivelEnergetico.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.nivelesEducativos = this.nivelesEducativos.filter(p => p.id !== id);
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

  abrirModal(): void {
    this.nivelEducativo = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id).subscribe({
      next: (response: ApiResponseWrapper<NivelEnergetico>) => {
        this.nivelEducativo = response.data || [];

        if (this.nivelEducativo) {
          this.modalVisible = true;
        }
      },
      error: (err) => {
        console.error('Error al editar: ', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al editar' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar(nivelEducativo: NivelEducativo) {
    this.cargando = true;

    const datos: NivelEducativo = {
      id: nivelEducativo.id,
      nombre: nivelEducativo.nombre,
      descripcion: nivelEducativo.descripcion,
      activo: nivelEducativo.activo
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
