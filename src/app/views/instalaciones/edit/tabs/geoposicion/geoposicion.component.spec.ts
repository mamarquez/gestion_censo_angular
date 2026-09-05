import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { GeoPosicionComponent } from './geoposicion.component';
import { CoordenadaService } from '../../../../../services/coordenada.service';
import { Coordenada } from '../../../../../models/coordenada';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { PuntoCoordenada } from '../../../../../components/mapa-coordenada/mapa-coordenada.component';

describe('GeoPosicionComponent', () => {
  let component: GeoPosicionComponent;
  let fixture: ComponentFixture<GeoPosicionComponent>;
  let serviceSpy: jasmine.SpyObj<CoordenadaService>;

  const coordenadaMock: Coordenada = {
    id: 7,
    xy_x: '40.4',
    xy_y: '-3.7',
    xy_z: '650',
    nmeaLatitud: '40.4',
    nmeaLongitud: '-3.7',
    utmX: '440000',
    utmY: '4474000',
    utmBanda: 'T',
    utmHuso: '30',
    gradosLatitud: '40',
    minutosLatitud: '25',
    segundosLatitud: '0.39',
    gradosLongitud: '-3',
    minutosLongitud: '42',
    segundosLongitud: '13.64',
    altitud: '650'
  };

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('CoordenadaService', ['get', 'updateRegistro']);

    await TestBed.configureTestingModule({
      imports: [GeoPosicionComponent],
      providers: [
        { provide: CoordenadaService, useValue: serviceSpy },
        MessageService,
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GeoPosicionComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    serviceSpy.get.and.returnValue(of(respuesta(null)));
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('carga la coordenada y rellena el formulario cuando cambia idInstalacion', () => {
    serviceSpy.get.and.returnValue(of(respuesta(coordenadaMock)));

    fixture.componentRef.setInput('idInstalacion', '7');
    fixture.detectChanges();

    expect(serviceSpy.get).toHaveBeenCalledWith('7');
    expect(component.geoForm.get('xy.x')?.value).toBe('40.4');
    expect(component.geoForm.get('utm.banda')?.value).toBe('T');
    expect(component.cargandoGeo()).toBeFalse();
    expect(component.coordenadas()).toEqual(coordenadaMock);
  });

  it('no rellena el formulario si la respuesta no trae datos', () => {
    serviceSpy.get.and.returnValue(of(respuesta(null)));

    fixture.componentRef.setInput('idInstalacion', '7');
    fixture.detectChanges();

    expect(component.coordenadas()).toBeUndefined();
    expect(component.cargandoGeo()).toBeFalse();
  });

  it('notifica error si la carga falla', () => {
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    fixture.componentRef.setInput('idInstalacion', '7');
    fixture.detectChanges();

    expect(component.cargandoGeo()).toBeFalse();
  });

  it('onPuntoSeleccionado() calcula GMS y UTM y rellena el formulario', () => {
    serviceSpy.get.and.returnValue(of(respuesta(null)));
    fixture.detectChanges();

    const punto: PuntoCoordenada = { lat: 40.416775, lng: -3.70379 };
    component.onPuntoSeleccionado(punto);

    expect(component.geoForm.get('xy.x')?.value).toBe('40.416775');
    expect(component.geoForm.get('nmea.longitud')?.value).toBe('-3.703790');
    expect(component.geoForm.get('gms.gradosLatitud')?.value).toBe('40');
    expect(component.geoForm.get('utm.huso')?.value).toBe('30');
  });

  it('onSubmit() no hace nada si el formulario es inválido', () => {
    serviceSpy.get.and.returnValue(of(respuesta(null)));
    fixture.componentRef.setInput('idInstalacion', '7');
    fixture.detectChanges();

    component.onSubmit();

    expect(serviceSpy.updateRegistro).not.toHaveBeenCalled();
  });

  it('onSubmit() guarda y emite el evento guardar cuando el formulario es válido', () => {
    serviceSpy.get.and.returnValue(of(respuesta(null)));
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));
    fixture.componentRef.setInput('idInstalacion', '7');
    fixture.detectChanges();

    component.geoForm.patchValue({ xy: { x: '40.4', y: '-3.7' } });

    const emitidos: Coordenada[] = [];
    component.guardar.subscribe(c => emitidos.push(c));

    component.onSubmit();

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith('7', jasmine.objectContaining({ id: 7 }));
    expect(emitidos.length).toBe(2);
    expect(component.cargandoGeo()).toBeFalse();
  });

  it('onSubmit() no hace nada si no hay idInstalacion aunque el formulario sea válido', () => {
    serviceSpy.get.and.returnValue(of(respuesta(null)));
    fixture.detectChanges();

    component.geoForm.patchValue({ xy: { x: '40.4', y: '-3.7' } });
    component.onSubmit();

    expect(serviceSpy.updateRegistro).not.toHaveBeenCalled();
  });

  it('onSubmit() notifica error si falla el guardado', () => {
    serviceSpy.get.and.returnValue(of(respuesta(null)));
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));
    fixture.componentRef.setInput('idInstalacion', '7');
    fixture.detectChanges();

    component.geoForm.patchValue({ xy: { x: '40.4', y: '-3.7' } });
    component.onSubmit();

    expect(component.cargandoGeo()).toBeFalse();
  });
});
