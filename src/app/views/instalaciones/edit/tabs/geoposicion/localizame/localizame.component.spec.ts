import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalizameComponent } from './localizame.component';
import { PuntoCoordenada } from '../../../../../../components/mapa-coordenada/mapa-coordenada.component';

describe('LocalizameComponent', () => {
  let component: LocalizameComponent;
  let fixture: ComponentFixture<LocalizameComponent>;
  let getCurrentPositionSpy: jasmine.Spy;

  beforeEach(async () => {
    getCurrentPositionSpy = spyOn(navigator.geolocation, 'getCurrentPosition');

    await TestBed.configureTestingModule({
      imports: [LocalizameComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LocalizameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('localizar() marca cargando y guarda el punto cuando la geolocalización tiene éxito', () => {
    getCurrentPositionSpy.and.callFake((success: PositionCallback) => {
      success({ coords: { latitude: 40.4, longitude: -3.7 } } as GeolocationPosition);
    });

    component.localizar();

    expect(component.punto()).toEqual({ lat: 40.4, lng: -3.7 });
    expect(component.cargando()).toBeFalse();
    expect(component.error()).toBeNull();
  });

  it('localizar() guarda el mensaje de error cuando se deniega el permiso', () => {
    getCurrentPositionSpy.and.callFake((_: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
    });

    component.localizar();

    expect(component.error()).toBe('Has denegado el acceso a tu ubicación.');
    expect(component.cargando()).toBeFalse();
  });

  it('localizar() guarda el mensaje de error cuando la posición no está disponible', () => {
    getCurrentPositionSpy.and.callFake((_: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 2, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
    });

    component.localizar();

    expect(component.error()).toBe('No se ha podido determinar tu ubicación.');
  });

  it('localizar() guarda el mensaje de error cuando se agota el tiempo de espera', () => {
    getCurrentPositionSpy.and.callFake((_: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 3, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
    });

    component.localizar();

    expect(component.error()).toBe('Se ha agotado el tiempo de espera al obtener tu ubicación.');
  });

  it('localizar() guarda un mensaje genérico ante un código de error desconocido', () => {
    getCurrentPositionSpy.and.callFake((_: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 99, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as unknown as GeolocationPositionError);
    });

    component.localizar();

    expect(component.error()).toBe('Error al obtener tu ubicación.');
  });

  it('ajustarPunto() actualiza el punto seleccionado', () => {
    const punto: PuntoCoordenada = { lat: 1, lng: 2 };

    component.ajustarPunto(punto);

    expect(component.punto()).toEqual(punto);
  });

  it('usarUbicacion() emite localizado cuando hay un punto', () => {
    const punto: PuntoCoordenada = { lat: 1, lng: 2 };
    component.ajustarPunto(punto);

    let emitido: PuntoCoordenada | undefined;
    component.localizado.subscribe(p => emitido = p);

    component.usarUbicacion();

    expect(emitido).toEqual(punto);
  });

  it('usarUbicacion() no emite nada si no hay punto seleccionado', () => {
    let emitido = false;
    component.localizado.subscribe(() => emitido = true);

    component.usarUbicacion();

    expect(emitido).toBeFalse();
  });

  it('alAbrir() dispara localizar()', () => {
    getCurrentPositionSpy.and.stub();

    component.alAbrir();

    expect(getCurrentPositionSpy).toHaveBeenCalled();
    expect(component.cargando()).toBeTrue();
  });
});
