import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatosComponent } from './datos.component';
import { InstalacionService } from '../../../../../services/instalacion.service';
import { Instalacion } from '../../../../../models/instalacion';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

describe('DatosComponent', () => {
  let component: DatosComponent;
  let fixture: ComponentFixture<DatosComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const instalacionMock: Instalacion = {
    id: 7,
    codigo: 'INS-7',
    nombre: 'Polideportivo',
    nombrePopular: 'El Polide',
    direccion: 'Calle Falsa 123',
    comunidad: { id: 1 } as any,
    provincia: { id: 11 } as any,
    municipio: { id: 111 } as any,
    referencia_catastral: 'REF123',
    cp: '11001',
    email: 'a@b.com',
    web: 'https://x.com',
    observaciones: 'obs'
  } as any;

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  function crearComponente(idRuta: string | null): void {
    const activatedRouteStub = {
      snapshot: { paramMap: { get: (_: string) => idRuta } }
    };

    TestBed.configureTestingModule({
      imports: [DatosComponent],
      providers: [
        { provide: InstalacionService, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
        MessageService,
        ConfirmationService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatosComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('InstalacionService', ['get']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
  });

  it('se crea correctamente y carga la instalación cuando hay id en la ruta', () => {
    crearComponente('7');
    serviceSpy.get.and.returnValue(of(respuesta(instalacionMock)));

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.get).toHaveBeenCalledWith('7');
    expect(component.instalacion).toEqual(instalacionMock);
    expect(component.form.get('codigo')?.value).toBe('INS-7');
    expect(component.cargando).toBeFalse();
  });

  it('emite cargandoChange(true) y luego cargandoChange(false) al cargar', () => {
    crearComponente('7');
    serviceSpy.get.and.returnValue(of(respuesta(instalacionMock)));
    const emitidos: boolean[] = [];
    component.cargandoChange.subscribe(v => emitidos.push(v));

    fixture.detectChanges();

    expect(emitidos).toEqual([true, false]);
  });

  it('no llama al servicio si no hay id en la ruta', () => {
    crearComponente(null);

    fixture.detectChanges();

    expect(serviceSpy.get).not.toHaveBeenCalled();
  });

  it('navega a /no-encontrado si la carga falla con 404', () => {
    crearComponente('7');
    serviceSpy.get.and.returnValue(throwError(() => ({ status: 404 })));

    fixture.detectChanges();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/no-encontrado', { skipLocationChange: true });
    expect(component.cargando).toBeFalse();
  });

  it('notifica error genérico si la carga falla con un estado distinto de 404', () => {
    crearComponente('7');
    serviceSpy.get.and.returnValue(throwError(() => ({ status: 500 })));

    fixture.detectChanges();

    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    expect(component.cargando).toBeFalse();
  });
});
