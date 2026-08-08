import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { InstalacionTelefono } from '../../../../../models/instalaciontelefono';
import { Instalacion } from '../../../../../models/instalacion';
import { ApiResponse } from '../../../../../models/apiresponse';
import { InstalacionTelefonoService } from '../../../../../services/instalaciontelefono.service';
import { InstalacionService } from '../../../../../services/instalacion.service';
import { DialogService } from '../../../../../services/dialog.service';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';

@Component({
  standalone: true,
  selector: 'app-datos-telefonos',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    ToastModule,
    SelectModule,
    InputText,
    TableModule,
    AccionesTablaComponent
  ],
  providers: [MessageService],
  templateUrl: './telefonos.component.html',
  styleUrl: './telefonos.component.css',
})
export class DatosTelefonosComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionTelefonoService);
  private readonly instalacionService = inject(InstalacionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  @Output() cargandoChange = new EventEmitter<boolean>();

  private id: string | null = null;

  telefonos: InstalacionTelefono[] = [];
  cargando = false;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [''],
    codigo: ['', Validators.required],
    numero: ['', Validators.required],
    contacto: [''],
    notas: [''],
    visible: [true, Validators.required]
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.cargarTelefonos(this.id);
      this.cargar();
    }
  }

  private cargarTelefonos(id: string): void {
    this.instalacionService.get(id).subscribe({
      next: (response: ApiResponse<Instalacion>) => {
        const telefonos = response.data ?? null;

        if (telefonos) {
          this.form.patchValue({
            id: this.id,
            codigo: telefonos.codigo
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los teléfonos', err);
      }
    });
  }

  private cargar(): void {
    this.cargando = true;
    this.cargandoChange.emit(true);
    this.cdr.detectChanges();

    this.service.get(this.id).subscribe({
      next: (response) => {
        if (Array.isArray(response.data)) {
          this.telefonos = response.data;
        } else if (response.data) {
          this.telefonos = [response.data];
        } else {
          this.telefonos = [];
        }

        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar teléfonos', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los teléfonos' });
        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      }
    });
  }

  guardar(): void {
    if (this.form.invalid || !this.id) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    const datos = {
      ...this.form.value
    };

    this.service.crear(datos).subscribe({
      next: (response: ApiResponse<InstalacionTelefono>) => {
        if (Array.isArray(response.data)) {
          this.telefonos = response.data;
        } else if (response.data) {
          this.telefonos = [response.data];
        } else {
          this.telefonos = [];
        }

        this.form.reset();
        this.messageService.add({ severity: 'success', summary: 'Añadido', detail: 'Teléfono añadido correctamente' });
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al guardar teléfono', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el teléfono' });
        this.guardando = false;
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
        const telefono = this.telefonos.find(p => p.id === id);
        if (telefono) {
          telefono.visible = !telefono.visible;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado del telefono', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(telefono: InstalacionTelefono): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar el teléfono "<strong>${telefono.numero}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(telefono.id)
    });
  }

  private borrarRegistro(id: number): void {
    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.telefonos = this.telefonos.filter(t => t.id !== id);
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Se ha borrado el teléfono correctamente' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar el teléfono', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al borrar el teléfono' });
        this.cdr.detectChanges();
      }
    });
  }
}
