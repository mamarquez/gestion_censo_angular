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
import { ImagenService } from '../../../../../services/imagen.service';
import { Imagen } from '../../../../../models/imagen';
import { AUTH } from '../../../../../auth/auth.constants';
import { TranslatePipe } from '@ngx-translate/core';
import { LoaderComponent } from '../../../../../layouts/loader/loader.component';
import { DialogService } from '../../../../../services/dialog.service';

@Component({
  standalone: true,
  selector: 'app-datos-imagenes',
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
  templateUrl: './imagen.component.html',
  styleUrl: './imagen.component.css'
})
export class ImagenComponent {

    private readonly fb = inject(FormBuilder);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly service = inject(ImagenService);
    private readonly dialog = inject(DialogService);
    private readonly messageService = inject(MessageService);
    private readonly destroyRef = inject(DestroyRef);

    descargarImagen = output<string>();

    idInstalacion = input<string>();
    cargando = false;

    imagenes: Imagen[] | null = null;
    imagenAmpliada: Imagen | null = null;

    guardando = false;

    imagenForm = this.fb.group({
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
                this.imagenForm.patchValue({ codigoInstalacion: id });
                this.cargar(id);
            }
        });
    };

    cargar(id: string): void {
        this.cargando = true;
    
        this.service.getAll(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response: ApiResponseWrapper<Imagen[]>) => {
              if (response.data) {
                this.imagenes = response.data.map(img => {
                  return {
                    ...img,
                    imagenUrl: `${AUTH.API}/instalacionesgaleria/images/${img.nombre}`
                  };
                });
              }

              this.cargando = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error cargando imagen:', err);
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
                    const actividadDeportiva = this.imagenes?.find(p => p.id === id);
                    if (actividadDeportiva) {
                        actividadDeportiva.visible = !actividadDeportiva.visible;
                    }

                    mensajesUtil(this.messageService, 'success', 'update');
                    this.cargando = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error al cambiar el estado de la imagen', err);
                    mensajesUtil(this.messageService, 'error', 'error');
                    this.cargando = false;
                    this.cdr.detectChanges();
                }
            });
    }

    confirmarBorrado(imagen: Imagen): void {
        this.dialog.confirmar({
          mensaje: `¿Deseas eliminar el espacio deportivo "<strong>${imagen.nombre}</strong>"?`,
          titulo: 'Confirmar eliminación',
          labelAceptar: 'Sí, eliminar',
          onAccept: () => this.borrarRegistro(imagen.id)
        });
      }

    private borrarRegistro(id: number): void {
        this.service.borrarRegistro(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    mensajesUtil(this.messageService, 'success', 'borrado');
                    
                    // Recargar la lista de imágenes tras un borrado exitoso
                    const idInstalacion = this.idInstalacion();
                    if (idInstalacion) {
                    this.cargar(idInstalacion);
                    }
                },
                error: (err) => {
                    console.error('Error borrando imagen:', err);
                    mensajesUtil(this.messageService, 'error', 'borrado');
                }
            });
    }

    descargar(nombreArchivo: string): void {
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
                    console.error('Error descargando imagen:', err);
                    mensajesUtil(this.messageService, 'error', 'descarga');
                }
            });
    }

    private readonly formatosPermitidos = [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/bmp',
        'image/vnd.wap.wbmp'
    ];

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files[0]) {
            const file = input.files[0];

            if (!this.formatosPermitidos.includes(file.type)) {
                mensajesUtil(this.messageService, 'error', 'formato');
                input.value = '';
                return;
            }

            const reader = new FileReader();

            reader.onload = () => {
                this.imagenForm.patchValue({
                    nombre: this.imagenForm.get('nombre')?.value || file.name,
                    contenido: reader.result as string
                });
            };

            reader.readAsDataURL(file);
        }

        input.value = '';
    }

    cancelarImagen(): void {
        this.imagenForm.reset();
    }

    guardarImagen(): void {
        const idInstalacion = this.idInstalacion();

        if (this.imagenForm.invalid || !idInstalacion) {
            this.imagenForm.markAllAsTouched();
            return;
        }

        this.guardando = true;

        const datos: Imagen = {
            idInstalacion: Number(idInstalacion),
            nombre: this.imagenForm.get('nombre')?.value ?? '',
            descripcion: this.imagenForm.get('descripcion')?.value ?? undefined,
            contenido: this.imagenForm.get('contenido')?.value ?? undefined,
            visible: true
        };

        this.service.addRegistro(datos)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    mensajesUtil(this.messageService, 'success', 'creado');
                    this.guardando = false;
                    this.imagenForm.reset();
                    this.cargar(idInstalacion);
                },
                error: (err) => {
                    console.error('Error al añadir la imagen', err);
                    mensajesUtil(this.messageService, 'error', 'error');
                    this.guardando = false;
                }
            });
    }

    tooltipVisibilidad(visible: boolean | undefined): string {
        return visible ? 'Ocultar' : 'Mostrar';
    }

    ampliar(imagen: Imagen): void {
        this.imagenAmpliada = imagen;
    }

    cerrarAmpliada(): void {
        this.imagenAmpliada = null;
    }
}