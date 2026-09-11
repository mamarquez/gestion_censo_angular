import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Instalacion } from '../../../models/instalacion';
import { InstalacionService } from '../../../services/instalacion.service';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { SelectProvinciaComponent } from '../../../components/select-provincia/select-provincia.component';
import { SelectMunicipioComponent } from '../../../components/select-municipio/select-provincia.component';
import { Fieldset } from "primeng/fieldset";
import { FilasAutoajustablesDirective, opcionesFilasPorPagina } from '../../../utils/filas-autoajustables.directive';

/**
 * @version 1.0.2
 */

@Component({
  standalone: true,
  selector: 'app-instalaciones',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    AccionesTablaComponent,
    SelectProvinciaComponent,
    SelectMunicipioComponent,
    Fieldset,
    FilasAutoajustablesDirective
],
  templateUrl: './instalaciones.component.html',
  styleUrl: './instalaciones.component.css'
})
export class ListInstalacionesComponent {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  instalaciones: Instalacion [] = [];
  cargando: boolean = true;
  filasPorPagina = 10;
  totalRegistros = 0;
  primeraPagina = 0;
  /**
   * `appFilasAutoajustables` calcula el tamaño real de página en un
   * `setTimeout` tras `ngOnInit` (ver su doc). Hasta que emita por primera
   * vez, `cargarPagina()` ignora el `onLazyLoad` inicial de `p-table` —
   * si no, esa primera carga pide el tamaño provisional (10) y se descarta
   * enseguida al recibirse el tamaño real, mostrándose un parpadeo 10→N.
   */
  private filasCalculadas = false;

  get opcionesFilasPorPagina(): number[] {
    return opcionesFilasPorPagina(this.filasPorPagina);
  }

  /**
   * Handler de `(filasChange)` de `appFilasAutoajustables`: el tamaño de página
   * calculado cambia fuera del ciclo de paginación normal de `p-table` (al
   * iniciar y en cada resize), así que hay que volver a la página 0 — si no,
   * `first` (calculado con el `rows` viejo) queda desincronizado del `rows`
   * nuevo y `cargarPagina()` calcula una página incorrecta.
   */
  onFilasChange(filas: number): void {
    this.filasPorPagina = filas;
    this.primeraPagina = 0;

    const primeraVez = !this.filasCalculadas;
    this.filasCalculadas = true;

    // La primera carga lazy de p-table (con el tamaño provisional 10) fue
    // ignorada en cargarPagina(); ahora que se conoce el tamaño real, se
    // dispara la carga real explícitamente.
    if (primeraVez) {
      this.cargarPagina({ first: 0, rows: filas }, true);
    }
  }

  form: FormGroup = this.fb.group({
    id: [null],
    codigo: [''],
    nombre: [''],
    provincia: [null],
    municipio: [null],
    activo: [true]
  });

  limpiar(): void {
    this.form.reset();
    this.primeraPagina = 0;
    this.buscar();
  }

  buscar(): void {
    this.primeraPagina = 0;
    this.cargarPagina({ first: 0, rows: this.filasPorPagina }, true);
  }

  /**
   * Handler de `(onLazyLoad)` de `p-table`: pide al backend solo la página que
   * PrimeNG necesita mostrar, en vez de traer el listado completo (paginación
   * server-side, la tabla ya no pagina en memoria).
   */
  cargarPagina(event: TableLazyLoadEvent, forzar = false): void {
    // Ignora el onLazyLoad automático que p-table dispara en su propio
    // ngOnInit con el tamaño de página todavía provisional (10): se
    // descartaría enseguida al recibirse el tamaño real (ver onFilasChange).
    // `forzar` deja pasar las llamadas explícitas (buscar/onFilasChange).
    if (!forzar && !this.filasCalculadas) {
      return;
    }

    const first = event.first ?? this.primeraPagina;
    const rows = event.rows ?? this.filasPorPagina;
    this.primeraPagina = first;

    const filtros = {
      ...this.form.value,
      page: Math.floor(first / rows),
      size: rows
    };
    this.cargando = true;

    this.service.getAll(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.instalaciones = Array.isArray(response?.data) ? response.data : [];
        this.totalRegistros = response?.totalRegistros ?? this.instalaciones.length;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.instalaciones = [];
        this.totalRegistros = 0;
        this.cdr.markForCheck();
      }
    });
  }

  editar(id: string): void {
    this.router.navigate(['/instalaciones', id]);
  }

  /**
   * Cambia la visibilidad de un registro
   * @param id Id del registro
   */
  cambiarVisible(id: number): void {
    this.cargando = true;

    this.service.cambiarVisible(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        const instalacion = this.instalaciones.find(p => p.id === id);
        if (instalacion) {
          instalacion.visible = !instalacion.visible;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar la visibilidad', err);
        mensajesUtil(this.messageService, 'error', 'error');
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

    this.service.cambiarEstado(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        const instalacion = this.instalaciones.find(p => p.id === id);
        if (instalacion) {
          instalacion.baja = !instalacion.baja;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(instalacion: Instalacion): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${instalacion.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(instalacion.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.instalaciones = this.instalaciones.filter(p => p.id !== id);
        mensajesUtil(this.messageService, 'success', 'delete');
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
