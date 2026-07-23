import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { Provincia } from '../../models/provincia';
import { ProvinciaService } from '../../services/provincia.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-provincia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    RadioButtonModule,
    CheckboxModule,
    DropdownModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  templateUrl: './provincia.component.html',
  styleUrl: './provincia.component.css'
})
export class ProvinciaComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProvinciaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  provincias: Provincia[] = [];
  cargando: boolean = true;

  form: FormGroup = this.fb.group({
    nombre: [''],
    ine: [''],
    activo: ['2']
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
          this.provincias = response.data;
        } else {
          this.provincias = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando provincias:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las provincias' });
        this.cargando = false;
        this.provincias = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.provincias = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar provincias', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  editarRegistro(provincia: any) {
    console.log('Editando:', provincia);
    // Tu lógica de edición aquí
  }

  cambiarEstado(id: number): void {
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const provincia = this.provincias.find(p => p.id === id);
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

  confirmarBorrado(provincia: Provincia): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${provincia.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(provincia.id)
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

  /*
    showInfo() {
        this.messageService.add({ severity: 'info', summary: 'Heads up', detail: 'There’s something you might want to check.' });
    }
    showSuccess() {
        this.messageService.add({ severity: 'success', summary: 'Saved successfully', detail: 'Your changes have been saved.' });
    }
    showWarn() {
        this.messageService.add({ severity: 'warn', summary: 'Check this', detail: 'Some fields may need your attention.' });
    }
    showError() {
        this.messageService.add({ severity: 'error', summary: 'Something went wrong', detail: 'We couldn’t complete the action. Please try again.' });
    }
    showSecondary() {
        this.messageService.add({ severity: 'secondary', summary: 'For your information', detail: 'This is a secondary toast message.' });
    }
    showContrast() {
        this.messageService.add({ severity: 'contrast', summary: 'High contrast', detail: 'This is a contrast toast message.' });
    }
   */
}
