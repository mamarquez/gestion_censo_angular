import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FieldsetModule } from 'primeng/fieldset';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { CoordenadaService } from '../../../../../services/coordenada.service';
import { DialogService } from '../../../../../services/dialog.service';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { Coordenada } from '../../../../../models/coordenada';
import { mensajesUtil } from '../../../../../utils/mensajes.util';

@Component({
  standalone: true,
  selector: 'app-instalacion-geoposicion',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FieldsetModule,
    FluidModule,
    InputTextModule
  ],
  templateUrl: './geoposicion.component.html'
})
export class GeoPosicionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CoordenadaService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // Inputs/Outputs con API moderna de Angular
  idInstalacion = input<string>();
  guardar = output<Coordenada>(); // Tipado con la interfaz Coordenada

  // Estados
  cargandoGeo = signal<boolean>(false);
  coordenadas = signal<Coordenada | undefined>(undefined);

  geoForm = this.fb.group({
    codigoInstalacion: [null],
    xy: this.fb.group({
      x: ['', Validators.required],
      y: ['', Validators.required],
      z: [null]
    }),
    nmea: this.fb.group({
      latitud: [null],
      longitud: [null]
    }),
    utm: this.fb.group({
      x: [null],
      y: [null],
      banda: [null],
      huso: [null]
    }),
    gms: this.fb.group({
      gradosLatitud: [null],
      minutosLatitud: [null],
      segundosLatitud: [null],
      gradosLongitud: [null],
      minutosLongitud: [null],
      segundosLongitud: [null],
      altitud: [null]
    })
  });

  constructor() {
    // Reacciona automáticamente cada vez que idInstalacion cambia de valor
    effect(() => {
      const id = this.idInstalacion();
      if (id) {
        this.geoForm.patchValue({ codigoInstalacion: String(id) });
        this.cargar(id);
      }
    });
  }

  cargar(id: string): void {
    this.cargandoGeo.set(true);

    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApiResponseWrapper<Coordenada>) => {
          if (response.data) {
            const c = response.data;
            this.coordenadas.set(c);

            this.geoForm.patchValue({
              xy: {
                x: c.xy_x ?? null,
                y: c.xy_y ?? null,
                z: c.xy_z ?? null
              },
              nmea: {
                latitud: c.nmeaLatitud ?? null,
                longitud: c.nmeaLongitud ?? null
              },
              utm: {
                x: c.utmX ?? null,
                y: c.utmY ?? null,
                banda: c.utmBanda ?? null,
                huso: c.utmHuso ?? null
              },
              gms: {
                gradosLatitud: c.gradosLatitud ?? null,
                minutosLatitud: c.minutosLatitud ?? null,
                segundosLatitud: c.segundosLatitud ?? null,
                gradosLongitud: c.gradosLongitud ?? null,
                minutosLongitud: c.minutosLongitud ?? null,
                segundosLongitud: c.segundosLongitud ?? null,
                altitud: c.altitud ?? null
              }
            });
          }
          this.cargandoGeo.set(false);
        },
        error: (err) => {
          console.error('Error cargando coordenada:', err);
          this.cargandoGeo.set(false);
          mensajesUtil(this.messageService, 'error', 'carga'); // Corregido 'errpr'
        }
      });
  }

  onSubmit(): void {
    if (this.geoForm.invalid) {
      this.geoForm.markAllAsTouched();
      return;
    }

    const val = this.geoForm.getRawValue();

    // Mapeo plano desde los FormGroups anidados a la interfaz Coordenada
    const dto: Coordenada = {
      id: Number(this.idInstalacion()),
      xy_x: val.xy.x ?? null,
      xy_y: val.xy.y ?? null,
      xy_z: val.xy.z ?? null,
      nmeaLatitud: val.nmea.latitud ?? null,
      nmeaLongitud: val.nmea.longitud ?? null,
      utmX: val.utm.x ?? null,
      utmY: val.utm.y ?? null,
      utmBanda: val.utm.banda ?? null,
      utmHuso: val.utm.huso ?? null,
      gradosLatitud: val.gms.gradosLatitud ?? null,
      minutosLatitud: val.gms.minutosLatitud ?? null,
      segundosLatitud: val.gms.segundosLatitud ?? null,
      gradosLongitud: val.gms.gradosLongitud ?? null,
      minutosLongitud: val.gms.minutosLongitud ?? null,
      segundosLongitud: val.gms.segundosLongitud ?? null,
      altitud: val.gms.altitud ?? null
    };

    const id = this.idInstalacion();

    if (!id) {
      return;
    }

    this.cargandoGeo.set(true);

    this.guardar.emit(dto);

    this.service.updateRegistro(id, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          mensajesUtil(this.messageService, 'success', 'update');
          this.cargandoGeo.set(false);
          this.guardar.emit(dto);
        },
        error: (err) => {
          console.error('Error al guardar la geoposición:', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.cargandoGeo.set(false);
        }
      });
  }
}
