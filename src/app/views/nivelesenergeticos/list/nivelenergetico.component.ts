import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { NivelEnergetico } from '../../../models/nivelenergetico';
import { NivelEnergeticoService } from '../../../services/nivelenergetico.service';
import { Conservacion } from '../../../models/conservacion';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';

@Component({
  standalone: true,
  selector: 'app-nivel-energetico',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    EditModalComponent,
    AccionesTablaComponent
  ],
  templateUrl: './nivelenergetico.component.html'
})
export class NivelEnergeticoComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(NivelEnergeticoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  nivelEnergetico: NivelEnergetico | any = null;
  nivelesEnergeticos: NivelEnergetico[] = [];
  cargando: boolean = true;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.maxLength(1)]],
    descripcion: [null],
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

    this.service.getAll(filtros).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.nivelesEnergeticos = response.data;
        } else {
          this.nivelesEnergeticos = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando conservaciones:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las conservaciones' });
        this.cargando = false;
        this.nivelesEnergeticos = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.nivelesEnergeticos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar niveles energéticos', err);
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
        const nivelEnergetico = this.nivelesEnergeticos.find(p => p.id === id);
        if (nivelEnergetico) {
          nivelEnergetico.activo = !nivelEnergetico.activo;
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

  editar(id: string) {
    this.service.get(id).subscribe({
      next: (response: ApiResponseWrapper<NivelEnergetico>) => {
        this.nivelEnergetico = response.data || [];

        if (this.nivelEnergetico) {
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

  private borrarRegistro(id: number): void {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.nivelesEnergeticos = this.nivelesEnergeticos.filter(p => p.id !== id);
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
    this.nivelEnergetico = null;
    this.modalVisible = true;
  }

  guardar(nivelEnergetico: NivelEnergetico) {
    this.cargando = true;

    const datos: NivelEnergetico = {
      id: nivelEnergetico.id,
      nombre: nivelEnergetico.nombre,
      descripcion: nivelEnergetico.descripcion,
      activo: nivelEnergetico.activo
    };

    if (datos.id) {

      console.log(datos);

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
