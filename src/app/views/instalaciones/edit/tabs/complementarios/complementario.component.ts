import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstalacionService } from '../../../../../services/instalacion.service';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../../../services/dialog.service';
import { EspacioDeportivo } from '../../../../../models/espaciodeportivo';

@Component({
  standalone: true,
  selector: 'app-datos-complementarios',
  imports: [],
  templateUrl: './complementario.component.html'
})
export class ComplementarioComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  @Output() cargandoChange = new EventEmitter<boolean>();

  private id: string | null = null;
  // espaciosDeportivos: InstalacionEspacioComplementario[] = [];
  cargando = false;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [''],
    idInstalacion: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    visible: ['', Validators.required],
    activo: ['', Validators.required]
  });

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.cargarDatos(this.id);
    }
  }

  private cargarDatos(id: string): void {
    /*
    this.cargando = true;
    this.cargandoChange.emit(true);

    this.service.getAll({ idInstalacion: id }).subscribe({
      next: (response: ApiResponse<InstalacionEspacioDeportivo[]>) => {
        this.espaciosDeportivos = response.data ?? [];

        this.form.patchValue({
          id: this.id
        });

        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar datos de instalaciones'
        });
        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      }
    });
    */
  }

  limpiar() {

  }

  buscar() {

  }

  cambiarEstado(id: number) {
    /*
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const espacioDeportivo = this.espaciosDeportivos.find(p => p.id === id);
        if (espacioDeportivo) {
          espacioDeportivo.activo = !espacioDeportivo.activo;
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
    */
  }

  cambiarVisible(id: number) {

  }

  confirmarBorrado(espacioDeportivo: EspacioDeportivo) {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar el teléfono "<strong>${espacioDeportivo.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(espacioDeportivo.id)
    });
  }

  private borrarRegistro(id: number): void {
    /*
    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.espaciosDeportivos = this.espaciosDeportivos.filter(t => t.id !== id);
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Se ha borrado correctamente' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al borrar' });
        this.cdr.detectChanges();
      }
    });
    */
  }

}
