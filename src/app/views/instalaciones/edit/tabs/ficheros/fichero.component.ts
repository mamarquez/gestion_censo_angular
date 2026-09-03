import { ChangeDetectorRef, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FieldsetModule } from 'primeng/fieldset';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { mensajesUtil } from '../../../../../utils/mensajes.util';
import { truncar } from '../../../../../utils/texto.util';
import { AUTH } from '../../../../../auth/auth.constants';
import { TranslatePipe } from '@ngx-translate/core';
import { LoaderComponent } from '../../../../../layouts/loader/loader.component';
import { DialogService } from '../../../../../services/dialog.service';
import { FicheroService } from '../../../../../services/fichero.service';
import { Fichero } from '../../../../../models/fichero';

@Component({
  standalone: true,
  selector: 'app-datos-ficheros',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FieldsetModule,
    FluidModule,
    InputTextModule,
    TooltipModule,
    DialogModule,
    TranslatePipe,
    LoaderComponent
  ],
  templateUrl: './fichero.component.html',
  styleUrl: './fichero.component.css'
})
export class FicheroComponent {
    private readonly fb = inject(FormBuilder);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly service = inject(FicheroService);
    private readonly dialog = inject(DialogService);
    private readonly messageService = inject(MessageService);
    private readonly destroyRef = inject(DestroyRef);

    descargarFichero = output<string>();
    idInstalacion = input<string>();
    cargando = false;
    guardando = false;
    ficheros: Fichero[] | null = null;

    ficheroForm = this.fb.group({
        id: this.fb.control<number | null>(null),
        codigoInstalacion: this.fb.control<string | null>(null),
        nombre: ['', Validators.required],
        descripcion: this.fb.control<string | null>(null),
        contenido: this.fb.control<string | null>(null, Validators.required)
    });

    constructor() {
        // Reacciona automáticamente cada vez que idInstalacion cambia de valor
        effect(() => {
            const id = this.idInstalacion();

            if (id) {
                this.ficheroForm.patchValue({ codigoInstalacion: id });
                this.cargar(id);
            }
        });
    };

    cargar(id: string): void {
        this.cargando = true;
    
        this.service.getAll(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (response: ApiResponseWrapper<Fichero[]>) => {
                if (response.data) {
                this.ficheros = response.data.map(img => {
                    return {
                    ...img,
                    ficheroUrl: `${AUTH.API}/instalacionesficheros/ficheros/${img.nombre}`
                    };
                });

                console.log('Ficheros cargados:', this.ficheros);
                }
                
                this.cargando = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error cargando fichero:', err);
                this.cargando = false;
                mensajesUtil(this.messageService, 'error', 'carga'); 
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
                    const fichero = this.ficheros?.find(p => p.id === id);
                    if (fichero) {
                        fichero.visible = !fichero.visible;
                    }

                    mensajesUtil(this.messageService, 'success', 'update');
                    this.cargando = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error al cambiar el estado del fichero', err);
                    mensajesUtil(this.messageService, 'error', 'error');
                    this.cargando = false;
                    this.cdr.detectChanges();
                }
            });
    }
    
    confirmarBorrado(fichero: Fichero): void {
        this.dialog.confirmar({
            mensaje: `¿Deseas eliminar el fichero "<strong>${fichero.nombre}</strong>"?`,
            titulo: 'Confirmar eliminación',
            labelAceptar: 'Sí, eliminar',
            onAccept: () => this.borrarRegistro(fichero.id)
        });
        }
    
    private borrarRegistro(id: number): void {
        this.service.borrarRegistro(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    mensajesUtil(this.messageService, 'success', 'borrado');
                    
                    // Recargar la lista de ficheros tras un borrado exitoso
                    const idInstalacion = this.idInstalacion();
                    if (idInstalacion) {
                    this.cargar(idInstalacion);
                    }
                },
                error: (err) => {
                    console.error('Error borrando fichero:', err);
                    mensajesUtil(this.messageService, 'error', 'borrado');
                }
            });
    }
    
    descargar(nombreArchivo: string): void {
        console.log('Descargando fichero:', nombreArchivo);
        this.service.descargar(nombreArchivo)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (blob: Blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = nombreArchivo;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                },
                error: (err) => {
                    console.error('Error descargando fichero:', err);
                    mensajesUtil(this.messageService, 'error', 'descarga');
                }
            });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                this.ficheroForm.patchValue({
                    nombre: this.ficheroForm.get('nombre')?.value || file.name,
                    contenido: reader.result as string
                });
            };

            reader.readAsDataURL(file);
        }

        input.value = '';
    }

    cancelarFichero(): void {
        this.ficheroForm.reset();
    }

    guardarFichero(): void {
        const idInstalacion = this.idInstalacion();

        if (this.ficheroForm.invalid || !idInstalacion) {
            this.ficheroForm.markAllAsTouched();
            return;
        }

        this.guardando = true;

        const datos: Fichero = {
            idInstalacion: Number(idInstalacion),
            nombre: this.ficheroForm.get('nombre')?.value ?? '',
            descripcion: this.ficheroForm.get('descripcion')?.value ?? undefined,
            contenido: this.ficheroForm.get('contenido')?.value ?? undefined,
            visible: true
        };

        this.service.addRegistro(datos)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    mensajesUtil(this.messageService, 'success', 'creado');
                    this.guardando = false;
                    this.ficheroForm.reset();
                    this.cargar(idInstalacion);
                },
                error: (err) => {
                    console.error('Error al añadir el fichero', err);
                    mensajesUtil(this.messageService, 'error', 'error');
                    this.guardando = false;
                }
            });
    }

    tooltipVisibilidad(visible: boolean | undefined): string {
        return visible ? 'Ocultar' : 'Mostrar';
    }

    truncar = truncar;
}