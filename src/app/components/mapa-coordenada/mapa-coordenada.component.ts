import { AfterViewInit, Component, ElementRef, NgZone, OnChanges, OnDestroy, SimpleChanges, ViewChild, inject, input, output } from '@angular/core';
import * as L from 'leaflet';

export interface PuntoCoordenada {
  lat: number;
  lng: number;
}

@Component({
  standalone: true,
  selector: 'app-mapa-coordenada',
  imports: [],
  templateUrl: './mapa-coordenada.component.html',
  styleUrl: './mapa-coordenada.component.css'
})
export class MapaCoordenadaComponent implements AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('mapaContenedor', { static: true }) private readonly mapaContenedor!: ElementRef<HTMLDivElement>;

  private readonly ngZone = inject(NgZone);

  puntoInicial = input<PuntoCoordenada | undefined>();
  soloLectura = input<boolean>(false);
  puntoCambiado = output<PuntoCoordenada>();

  private mapa!: L.Map;
  private marcador?: L.CircleMarker;
  private mapaListo = false;

  private emitiendoInterno = false;

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.inicializarMapa();
      this.mapaListo = true;

      setTimeout(() => {
        this.mapa.invalidateSize();
        this.colocarPuntoInicial();
      }, 0);
    });
  }

  /**
   * Fuerza a Leaflet a recalcular el tamaño de su contenedor. Necesario cuando
   * el mapa vive dentro de un elemento que aparece con animación (p.ej. un
   * popover): en el momento de crearse el mapa el contenedor puede no tener
   * aún sus dimensiones finales, y Leaflet se queda con tiles a medias hasta
   * que se le avisa explícitamente de que su tamaño ha cambiado.
   */
  redibujar(): void {
    this.ngZone.runOutsideAngular(() => {
      this.mapa?.invalidateSize();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['puntoInicial'] && this.mapaListo) {
      if (this.emitiendoInterno) {
        this.emitiendoInterno = false;
        return;
      }

      this.colocarPuntoInicial();
    }
  }

  private colocarPuntoInicial(): void {
    const punto = this.puntoInicial();

    if (!punto) {
      return;
    }

    this.colocarMarcador(L.latLng(punto.lat, punto.lng), false);

    this.ngZone.runOutsideAngular(() => {
      this.mapa.setView([punto.lat, punto.lng], 10);
    });
  }

  private inicializarMapa(): void {

    this.mapa = L.map(this.mapaContenedor.nativeElement).setView([20, 0], 2);

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(this.mapa);

    if (!this.soloLectura()) {
      this.mapa.on('click', (event: L.LeafletMouseEvent) => {
        this.colocarMarcador(event.latlng, true);
      });
    }
  }

  private colocarMarcador(latlng: L.LatLng, emitir: boolean): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.marcador) {
        this.marcador.setLatLng(latlng);
      } else {
        this.marcador = L.circleMarker(latlng, {
          radius: 7,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 1,
          weight: 2
        }).addTo(this.mapa);

        if (!this.soloLectura()) {
          this.habilitarArrastre(this.marcador);
        }
      }
    });

    if (emitir) {
      this.emitirPunto(latlng);
    }
  }

  private habilitarArrastre(marcador: L.CircleMarker): void {
    let arrastrando = false;

    marcador.on('mousedown', () => {
      arrastrando = true;
      this.mapa.dragging.disable();
    });

    this.mapa.on('mousemove', (event: L.LeafletMouseEvent) => {
      if (!arrastrando) {
        return;
      }

      marcador.setLatLng(event.latlng);
    });

    this.mapa.on('mouseup', () => {
      if (!arrastrando) {
        return;
      }

      arrastrando = false;
      this.mapa.dragging.enable();
      this.emitirPunto(marcador.getLatLng());
    });
  }

  private emitirPunto(latlng: L.LatLng): void {
    this.emitiendoInterno = true;

    this.ngZone.run(() => {
      this.puntoCambiado.emit({ lat: latlng.lat, lng: latlng.lng });
    });
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }
}
