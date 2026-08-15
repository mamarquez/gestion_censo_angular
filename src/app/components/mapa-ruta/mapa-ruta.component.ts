import { AfterViewInit, Component, ElementRef, inject, input, OnChanges, OnDestroy, output, SimpleChanges, ViewChild } from '@angular/core';
import * as L from 'leaflet';

export interface PuntoRuta {
  id?: number;
  x: number;
  y: number;
}

@Component({
  standalone: true,
  selector: 'app-mapa-ruta',
  imports: [],
  templateUrl: './mapa-ruta.component.html',
  styleUrl: './mapa-ruta.component.css'
})
export class MapaRutaComponent implements AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('mapaContenedor', { static: true }) private mapaContenedor!: ElementRef<HTMLDivElement>;

  puntosIniciales = input<PuntoRuta[]>([]);
  rutaCambiada = output<PuntoRuta[]>();

  private mapa!: L.Map;

  private ruta: L.LatLng[] = [];

  private idsPuntos: (number | undefined)[] = [];

  private marcadores: L.CircleMarker[] = [];

  private polyline!: L.Polyline;

  private mapaListo = false;

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.mapaListo = true;

    // El contenedor puede no tener aún su tamaño final (p.ej. dentro de un tab/fieldset),
    // lo que hace que Leaflet cargue solo un tile inicial y el resto se vea en blanco.
    // Se invalida el tamaño ANTES de dibujar la ruta para que la polyline se calcule
    // ya sobre las dimensiones reales del contenedor.
    setTimeout(() => {
      this.mapa.invalidateSize();
      this.cargarPuntosIniciales();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['puntosIniciales'] && this.mapaListo) {
      this.cargarPuntosIniciales();
    }
  }

  private cargarPuntosIniciales(): void {
    this.limpiarRuta(false);

    const puntos = this.puntosIniciales();

    if (!puntos.length) {
      return;
    }

    puntos.forEach(punto => this.agregarPunto(L.latLng(punto.x, punto.y), false, punto.id));

    if (this.ruta.length > 0) {
      this.mapa.fitBounds(this.polyline.getBounds(), { padding: [20, 20] });
    }
  }

  private inicializarMapa(): void {

    this.mapa = L.map(this.mapaContenedor.nativeElement).setView(
      [40.416775, -3.703790],
      13
    );

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(this.mapa);

    this.polyline = L.polyline([], {
      color: '#e11d48',
      weight: 5,
      opacity: 1
    }).addTo(this.mapa);

    this.mapa.on('click', (event: L.LeafletMouseEvent) => {
      this.agregarPunto(event.latlng, true);
    });
  }

  private agregarPunto(latlng: L.LatLng, emitir: boolean, id?: number): void {

    this.ruta.push(latlng);
    this.idsPuntos.push(id);

    const marcador = L.circleMarker(latlng, {
      radius: 3,
      color: '#e11d48',
      fillColor: '#ffffff',
      fillOpacity: 1,
      weight: 2
    }).addTo(this.mapa);

    marcador.bindTooltip(id !== undefined ? `${id}` : '?', {
      permanent: false,
      direction: 'top',
      offset: [0, -6],
      className: 'mapa-ruta-tooltip-punto'
    });

    this.habilitarArrastre(marcador);

    this.marcadores.push(marcador);

    this.actualizarRuta();

    if (emitir) {
      this.emitirRuta();
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

      const indice = this.marcadores.indexOf(marcador);

      if (indice !== -1) {
        this.ruta[indice] = event.latlng;
        this.actualizarRuta();
      }
    });

    this.mapa.on('mouseup', () => {
      if (!arrastrando) {
        return;
      }

      arrastrando = false;
      this.mapa.dragging.enable();
      this.emitirRuta();
    });
  }

  private actualizarRuta(): void {
    this.polyline.setLatLngs(this.ruta);
  }

  asignarIdUltimoPunto(id: number): void {
    const indice = this.marcadores.length - 1;

    if (indice < 0) {
      return;
    }

    this.idsPuntos[indice] = id;
    this.marcadores[indice].setTooltipContent(`${id}`);
  }

  private emitirRuta(): void {
    this.rutaCambiada.emit(this.obtenerRuta());
  }

  limpiarRuta(emitir: boolean = true): void {

    this.ruta = [];
    this.idsPuntos = [];

    this.marcadores.forEach(
      marcador => marcador.remove()
    );

    this.marcadores = [];

    this.polyline?.setLatLngs([]);

    if (emitir) {
      this.emitirRuta();
    }
  }

  obtenerRuta(): PuntoRuta[] {
    return this.ruta.map((punto, indice) => ({
      id: this.idsPuntos[indice],
      x: punto.lat,
      y: punto.lng
    }));
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }
}
