import { Component, ViewChild, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { MapaCoordenadaComponent, PuntoCoordenada } from '../../../../../../components/mapa-coordenada/mapa-coordenada.component';

/**
 * @version 2.2.0
 */

@Component({
  standalone: true,
  selector: 'app-localizame',
  imports: [
    ButtonModule,
    PopoverModule,
    MapaCoordenadaComponent
  ],
  templateUrl: './localizame.component.html',
  styleUrl: './localizame.component.css',
})
export class LocalizameComponent {

  @ViewChild(MapaCoordenadaComponent) private readonly mapaComponente?: MapaCoordenadaComponent;

  localizado = output<PuntoCoordenada>();

  cargando = signal(false);
  error = signal<string | null>(null);
  punto = signal<PuntoCoordenada | null>(null);

  alAbrir(): void {
    this.localizar();
    setTimeout(() => this.mapaComponente?.redibujar(), 150);
  }

  localizar(): void {
    this.cargando.set(true);
    this.error.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.punto.set({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        this.cargando.set(false);
      },
      (err) => {
        this.error.set(this.mensajeError(err));
        this.cargando.set(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );

  }

  ajustarPunto(punto: PuntoCoordenada): void {
    this.punto.set(punto);
  }

  usarUbicacion(): void {
    const punto = this.punto();

    if (punto) {
      this.localizado.emit(punto);
    }
  }

  private mensajeError(err: GeolocationPositionError): string {

    switch (err.code) {
      case err.PERMISSION_DENIED:
        return 'Has denegado el acceso a tu ubicación.';
      case err.POSITION_UNAVAILABLE:
        return 'No se ha podido determinar tu ubicación.';
      case err.TIMEOUT:
        return 'Se ha agotado el tiempo de espera al obtener tu ubicación.';
      default:
        return 'Error al obtener tu ubicación.';
    }

  }

}
