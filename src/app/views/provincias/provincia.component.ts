import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
// import { ToastModule } from 'primeng/toast';

import { Provincia } from '../../models/provincia';
import { ProvinciaService } from '../../services/provincia.service';

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
    InputTextModule
  ],
  templateUrl: './provincia.component.html',
  styleUrl: './provincia.component.css'
})
export class ProvinciaComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProvinciaService);
  private readonly cdr = inject(ChangeDetectorRef);

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

    this.service.getProvincias(filtros).subscribe({
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
