import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import * as L from 'leaflet';
import { MapaRutaComponent, PuntoRuta } from './mapa-ruta.component';

describe('MapaRutaComponent', () => {
  let component: MapaRutaComponent;
  let fixture: ComponentFixture<MapaRutaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaRutaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapaRutaComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('se crea correctamente e inicializa el mapa', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    expect(component).toBeTruthy();
  }));

  it('carga los puntos iniciales al recibirlos por input', fakeAsync(() => {
    const puntos: PuntoRuta[] = [
      { id: 1, x: 40.0, y: -3.0 },
      { id: 2, x: 40.1, y: -3.1 }
    ];
    fixture.componentRef.setInput('puntosIniciales', puntos);
    fixture.detectChanges();
    tick(0);

    expect(component.obtenerRuta().length).toBe(2);
  }));

  it('ngOnChanges recarga los puntos cuando puntosIniciales cambia tras estar listo el mapa', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    fixture.componentRef.setInput('puntosIniciales', [{ id: 5, x: 41, y: -4 }] as PuntoRuta[]);
    fixture.detectChanges();

    expect(component.obtenerRuta()).toEqual([{ id: 5, x: 41, y: -4 }]);
  }));

  it('un click en el mapa en modo edición añade un punto y emite la ruta', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    let emitida: PuntoRuta[] | undefined;
    component.rutaCambiada.subscribe(r => emitida = r);

    (component as any).agregarPunto(L.latLng(10, 20), true);

    expect(component.obtenerRuta().length).toBe(1);
    expect(emitida?.length).toBe(1);
  }));

  it('agregarPunto() no emite si emitir=false', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    let emitido = false;
    component.rutaCambiada.subscribe(() => emitido = true);

    (component as any).agregarPunto(L.latLng(10, 20), false);

    expect(emitido).toBeFalse();
    expect(component.obtenerRuta().length).toBe(1);
  }));

  it('setBloqueado(true) impide que un click en el mapa añada un punto', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    component.setBloqueado(true);
    (component as any).mapa.fire('click', { latlng: L.latLng(1, 1) });

    expect(component.obtenerRuta().length).toBe(0);
  }));

  it('asignarIdUltimoPunto() actualiza el id del último punto añadido', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);
    (component as any).agregarPunto(L.latLng(10, 20), false);

    component.asignarIdUltimoPunto(99);

    expect(component.obtenerRuta()[0].id).toBe(99);
  }));

  it('asignarIdUltimoPunto() no hace nada si no hay puntos', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    expect(() => component.asignarIdUltimoPunto(1)).not.toThrow();
  }));

  it('limpiarRuta() vacía la ruta y por defecto emite el cambio', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);
    (component as any).agregarPunto(L.latLng(10, 20), false);

    let emitida: PuntoRuta[] | undefined;
    component.rutaCambiada.subscribe(r => emitida = r);

    component.limpiarRuta();

    expect(component.obtenerRuta()).toEqual([]);
    expect(emitida).toEqual([]);
  }));

  it('limpiarRuta(false) no emite el cambio', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);
    (component as any).agregarPunto(L.latLng(10, 20), false);

    let emitido = false;
    component.rutaCambiada.subscribe(() => emitido = true);

    component.limpiarRuta(false);

    expect(emitido).toBeFalse();
  }));

  it('actualizarRuta() trae la polyline al frente cuando hay puntos consecutivos coincidentes', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    (component as any).agregarPunto(L.latLng(10, 20), false);
    const bringToFrontSpy = spyOn((component as any).polyline, 'bringToFront').and.callThrough();

    (component as any).agregarPunto(L.latLng(10, 20), false);

    expect(bringToFrontSpy).toHaveBeenCalled();
  }));

  it('actualizarRuta() no trae la polyline al frente si los puntos son distintos', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    (component as any).agregarPunto(L.latLng(10, 20), false);
    const bringToFrontSpy = spyOn((component as any).polyline, 'bringToFront').and.callThrough();

    (component as any).agregarPunto(L.latLng(11, 21), false);

    expect(bringToFrontSpy).not.toHaveBeenCalled();
  }));

  it('ngOnDestroy() desconecta el ResizeObserver y no lanza error', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    expect(() => fixture.destroy()).not.toThrow();
  }));

  it('en modo soloLectura un click en el mapa no añade puntos', fakeAsync(() => {
    fixture.componentRef.setInput('soloLectura', true);
    fixture.detectChanges();
    tick(0);

    (component as any).mapa.fire('click', { latlng: L.latLng(1, 1) });

    expect(component.obtenerRuta().length).toBe(0);
  }));
});
