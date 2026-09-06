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
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { Coordenada } from '../../../../../models/coordenada';
import { mensajesUtil } from '../../../../../utils/mensajes.util';
import { LocalizameComponent } from './localizame/localizame.component';
import { PuntoCoordenada } from '../../../../../components/mapa-coordenada/mapa-coordenada.component';
import { decimalAGms, gmsADecimal, latLngAUtm, utmALatLng } from '../../../../../utils/coordenadas.util';

@Component({
  standalone: true,
  selector: 'app-instalacion-geoposicion',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FieldsetModule,
    FluidModule,
    InputTextModule,
    LocalizameComponent
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

  // Evita bucles al propagar un cambio entre secciones (XY/NMEA/UTM/GMS)
  private sincronizando = false;

  constructor() {
    // Reacciona automáticamente cada vez que idInstalacion cambia de valor
    effect(() => {
      const id = this.idInstalacion();
      if (id) {
        this.geoForm.patchValue({ codigoInstalacion: String(id) });
        this.cargar(id);
      }
    });

    // Cualquier sección editada manualmente recalcula el resto
    this.geoForm.get('xy.x')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalcularDesdeXY());
    this.geoForm.get('xy.y')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalcularDesdeXY());

    this.geoForm.get('nmea.latitud')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalcularDesdeNmea());
    this.geoForm.get('nmea.longitud')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalcularDesdeNmea());

    ['gradosLatitud', 'minutosLatitud', 'segundosLatitud', 'gradosLongitud', 'minutosLongitud', 'segundosLongitud']
      .forEach(campo => {
        this.geoForm.get(`gms.${campo}`)?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.recalcularDesdeGms());
      });

    ['x', 'y', 'huso', 'banda'].forEach(campo => {
      this.geoForm.get(`utm.${campo}`)?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.recalcularDesdeUtm());
    });
  }

  /** Aplica un lat/lng a XY, NMEA, GMS y UTM, saltando la sección de origen. */
  private aplicarLatLng(lat: number, lng: number, origen: 'xy' | 'nmea' | 'gms' | 'utm' | 'mapa'): void {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    this.sincronizando = true;

    const gmsLatitud = decimalAGms(lat);
    const gmsLongitud = decimalAGms(lng);
    const utm = latLngAUtm(lat, lng);

    const valores: any = {};

    if (origen !== 'xy') {
      valores.xy = { x: lat.toFixed(6), y: lng.toFixed(6) };
    }
    if (origen !== 'nmea') {
      valores.nmea = { latitud: lat.toFixed(6), longitud: lng.toFixed(6) };
    }
    if (origen !== 'gms') {
      valores.gms = {
        gradosLatitud: gmsLatitud.grados,
        minutosLatitud: gmsLatitud.minutos,
        segundosLatitud: gmsLatitud.segundos,
        gradosLongitud: gmsLongitud.grados,
        minutosLongitud: gmsLongitud.minutos,
        segundosLongitud: gmsLongitud.segundos
      };
    }
    if (origen !== 'utm') {
      valores.utm = { x: utm.x, y: utm.y, banda: utm.banda, huso: utm.huso };
    }

    this.geoForm.patchValue(valores, { emitEvent: false });
    this.sincronizando = false;
  }

  private recalcularDesdeXY(): void {
    if (this.sincronizando) {
      return;
    }
    const lat = Number(this.geoForm.get('xy.x')?.value);
    const lng = Number(this.geoForm.get('xy.y')?.value);
    this.aplicarLatLng(lat, lng, 'xy');
  }

  private recalcularDesdeNmea(): void {
    if (this.sincronizando) {
      return;
    }
    const lat = Number(this.geoForm.get('nmea.latitud')?.value);
    const lng = Number(this.geoForm.get('nmea.longitud')?.value);
    this.aplicarLatLng(lat, lng, 'nmea');
  }

  private recalcularDesdeGms(): void {
    if (this.sincronizando) {
      return;
    }

    const campos: string[] = ['gradosLatitud', 'minutosLatitud', 'segundosLatitud', 'gradosLongitud', 'minutosLongitud', 'segundosLongitud'];
    const valores: unknown[] = campos.map(campo => this.geoForm.get(`gms.${campo}`)?.value);

    if (valores.some(v => v === null || v === undefined || v === '')) {
      return;
    }

    const [gradosLat, minutosLat, segundosLat, gradosLng, minutosLng, segundosLng] = valores.map(Number);

    if (![gradosLat, minutosLat, segundosLat, gradosLng, minutosLng, segundosLng].every(Number.isFinite)) {
      return;
    }

    const lat = gmsADecimal(gradosLat, minutosLat, segundosLat);
    const lng = gmsADecimal(gradosLng, minutosLng, segundosLng);
    this.aplicarLatLng(lat, lng, 'gms');
  }

  private recalcularDesdeUtm(): void {
    if (this.sincronizando) {
      return;
    }

    const x = Number(this.geoForm.get('utm.x')?.value);
    const y = Number(this.geoForm.get('utm.y')?.value);
    const huso = Number(this.geoForm.get('utm.huso')?.value);
    const banda: string = this.geoForm.get('utm.banda')?.value ?? '';

    if (!x || !y || !Number.isFinite(huso) || huso <= 0 || !banda) {
      return;
    }

    const { lat, lng } = utmALatLng(x, y, huso, banda);
    this.aplicarLatLng(lat, lng, 'utm');
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
            }, { emitEvent: false });
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

  onPuntoSeleccionado(punto: PuntoCoordenada): void {
    this.aplicarLatLng(punto.lat, punto.lng, 'mapa');
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
