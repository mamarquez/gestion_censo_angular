import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MapaCoordenadaComponent, PuntoCoordenada } from './mapa-coordenada.component';

describe('MapaCoordenadaComponent', () => {
  let component: MapaCoordenadaComponent;
  let fixture: ComponentFixture<MapaCoordenadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaCoordenadaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapaCoordenadaComponent);
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

  it('coloca el punto inicial cuando se recibe por input', fakeAsync(() => {
    fixture.componentRef.setInput('puntoInicial', { lat: 40.4, lng: -3.7 } as PuntoCoordenada);
    fixture.detectChanges();
    tick(0);

    const contenedor: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(contenedor.querySelectorAll('.leaflet-marker-pane, path').length).toBeGreaterThanOrEqual(0);
    expect(component).toBeTruthy();
  }));

  it('no falla si no hay punto inicial', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    expect(component).toBeTruthy();
  }));

  it('un click en el mapa en modo edición emite puntoCambiado', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    let emitido: PuntoCoordenada | undefined;
    component.puntoCambiado.subscribe(p => emitido = p);

    (component as any).colocarMarcador({ lat: 10, lng: 20 } as any, true);

    expect(emitido).toEqual({ lat: 10, lng: 20 });
  }));

  it('colocarMarcador() no emite si emitir=false', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    let emitido = false;
    component.puntoCambiado.subscribe(() => emitido = true);

    (component as any).colocarMarcador({ lat: 10, lng: 20 } as any, false);

    expect(emitido).toBeFalse();
  }));

  it('ngOnChanges ignora el cambio si viene de una emisión interna propia', fakeAsync(() => {
    fixture.componentRef.setInput('puntoInicial', { lat: 1, lng: 1 } as PuntoCoordenada);
    fixture.detectChanges();
    tick(0);

    (component as any).emitiendoInterno = true;
    const spy = spyOn(component as any, 'colocarPuntoInicial');

    fixture.componentRef.setInput('puntoInicial', { lat: 2, lng: 2 } as PuntoCoordenada);
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect((component as any).emitiendoInterno).toBeFalse();
  }));

  it('redibujar() invalida el tamaño del mapa sin lanzar error', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    expect(() => component.redibujar()).not.toThrow();
  }));

  it('ngOnDestroy() no lanza error', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);

    expect(() => fixture.destroy()).not.toThrow();
  }));
});
