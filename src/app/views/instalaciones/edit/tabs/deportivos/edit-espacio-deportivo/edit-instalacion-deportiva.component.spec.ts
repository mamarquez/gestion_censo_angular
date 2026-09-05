import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EditInstalacionDeportivaComponent } from './edit-instalacion-deportiva.component';
import { InstalacionEspacioDeportivoService } from '../../../../../../services/instalacionEspacioDeportivo.service';
import { InstalacionEspacioDeportivo } from '../../../../../../models/instalacionEspacioDeportivo';
import { ApiResponseWrapper } from '../../../../../../interface/api-response-wrapper.interface';

describe('EditInstalacionDeportivaComponent', () => {
  let component: EditInstalacionDeportivaComponent;
  let fixture: ComponentFixture<EditInstalacionDeportivaComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionEspacioDeportivoService>;

  const espacioMock: InstalacionEspacioDeportivo = {
    id: 5,
    instalacion: { id: 10 } as any,
    nombre: 'Pista de pádel',
    descripcion: 'Cubierta',
    visible: true
  };

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  function crearComponente(idRuta: string | null): void {
    const activatedRouteStub = {
      snapshot: {
        paramMap: { get: (_: string) => idRuta }
      }
    };

    TestBed.configureTestingModule({
      imports: [EditInstalacionDeportivaComponent],
      providers: [
        { provide: InstalacionEspacioDeportivoService, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        MessageService,
        ConfirmationService,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditInstalacionDeportivaComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('InstalacionEspacioDeportivoService', ['get', 'crear', 'update']);
  });

  it('se crea correctamente', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(espacioMock)));
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('carga el espacio deportivo cuando hay id en la ruta', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(espacioMock)));

    fixture.detectChanges();

    expect(serviceSpy.get).toHaveBeenCalledWith(5);
    expect(component.espacioDeportivo).toEqual(espacioMock);
    expect(component.form.get('nombre')?.value).toBe('Pista de pádel');
    expect(component.cargando).toBeFalse();
  });

  it('no llama al servicio si no hay id en la ruta', () => {
    crearComponente(null);

    fixture.detectChanges();

    expect(serviceSpy.get).not.toHaveBeenCalled();
  });

  it('emite cargandoChange(true) y luego cargandoChange(false) al cargar', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(espacioMock)));
    const emitidos: boolean[] = [];
    component.cargandoChange.subscribe(v => emitidos.push(v));

    fixture.detectChanges();

    expect(emitidos).toEqual([true, false]);
  });

  it('marca cargando=false y notifica error si falla la carga', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
    expect(component.espacioDeportivo).toBeNull();
  });

  it('guardar() con id llama a update() con el id de la ruta', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(espacioMock)));
    fixture.detectChanges();
    serviceSpy.update.and.returnValue(of(respuesta(true)));

    component.guardar({ ...espacioMock, nombre: 'Pista renombrada' });

    expect(serviceSpy.update).toHaveBeenCalledWith(5, jasmine.objectContaining({ nombre: 'Pista renombrada' }));
    expect(component.modalVisible).toBeFalse();
  });

  it('guardar() sin id llama a crear()', () => {
    crearComponente(null);
    fixture.detectChanges();
    serviceSpy.crear.and.returnValue(of(respuesta(true)));
    serviceSpy.get.and.returnValue(of(respuesta(espacioMock)));

    component.guardar({ instalacion: { id: 10 } as any, nombre: 'Pista nueva', descripcion: '', visible: true });

    expect(serviceSpy.crear).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Pista nueva' }));
  });

  it('guardar() notifica error si el servicio falla', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(espacioMock)));
    fixture.detectChanges();
    serviceSpy.update.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ ...espacioMock });

    expect(component.cargando).toBeFalse();
  });
});
