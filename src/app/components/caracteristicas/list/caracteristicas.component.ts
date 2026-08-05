import { ChangeDetectorRef, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogService } from '../../../services/dialog.service';
import { InstalacionCaracteristicaService } from '../../../services/instalacionCaracteristica.service';
import { InstalacionCaracteristica } from '../../../models/instalacionCaracteristica';
import { ApiResponse } from '../../../models/apiresponse';

@Component({
  standalone: true,
  selector: 'app-list-caracteristicas',
  imports: [
    AccionesTablaComponent,
    FormsModule,
    Button,
    InputText,
    PrimeTemplate,
    ReactiveFormsModule,
    TableModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './caracteristicas.component.html',
  styleUrl: './caracteristicas.component.css',
})
export class ListCaracteristicasComponent implements OnChanges {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionCaracteristicaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  @Input() idEspacioDeportivo: number | null = null;

  cargando: boolean = false;
  caracteristicas: InstalacionCaracteristica[] = [];

  form: FormGroup = this.fb.group({
    nombre: ['']
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idEspacioDeportivo'] && this.idEspacioDeportivo) {
      this.cargar();
    }
  }

  private cargar(): void {
    if (!this.idEspacioDeportivo) return;

    this.cargando = true;

    const filtros = {
      ...this.form.value,
      instalacionEspacioDeportivo: this.idEspacioDeportivo
    };

    this.service.getAll(filtros).subscribe({
      next: (response) => {
        this.caracteristicas = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar características', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las características' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiar(): void {
    this.form.reset();
    this.cargar();
  }

  buscar(): void {
    this.cargar();
  }

  abrirModal(): void {

  }

  cambiarVisible(id: number): void {
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const caracteristica = this.caracteristicas.find(c => c.id === id);
        if (caracteristica) {
          caracteristica.visible = !caracteristica.visible;
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

  confirmarBorrado(caracteristica: InstalacionCaracteristica): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${caracteristica.medida.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(caracteristica.id!)
    });
  }

  private borrarRegistro(id: number): void {
    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.caracteristicas = this.caracteristicas.filter(c => c.id !== id);
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Se ha borrado correctamente' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al borrar' });
        this.cdr.detectChanges();
      }
    });
  }
}
