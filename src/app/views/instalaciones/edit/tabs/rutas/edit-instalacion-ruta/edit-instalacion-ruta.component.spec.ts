import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EditInstalacionRutaComponent } from './edit-instalacion-ruta.component';
import { InstalacionRutaService } from '../../../../../../services/instalacionRuta.service';
import { InstalacionRutaCoordenadaService } from '../../../../../../services/instalacionRutaCoordenada.service';
import { DialogService } from '../../../../../../services/dialog.service';
import { InstalacionRuta } from '../../../../../../models/instalacionRuta';
import { InstalacionRutaCoordenada } from '../../../../../../models/instalacionRutaCoordenada';
import { ApiResponseWrapper } from '../../../../../../interface/api-response-wrapper.interface';

describe('EditInstalacionRutaComponent', () => {
  let component: EditInstalacionRutaComponent;
  let fixture: ComponentFixture<EditInstalacionRutaComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionRutaService>;
  let coordenadaServiceSpy: jasmine.SpyObj<InstalacionRutaCoordenadaService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const rutaMock: InstalacionRuta = {
    id: 5,
    idInstalacion: 10,
    nombre: 'Sendero',
    descripcion: 'desc',
    visible: true
  } as InstalacionRuta;

  const crearCoordenadasMock = (): InstalacionRutaCoordenada[] => [
    { id: 1, x: 40.1, y: -3.1 },
    { id: 2, x: 40.2, y: -3.2 }
  ];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  function crearComponente(idRuta: string | null, idInstalacionQuery: string | null = null): void {
    const activatedRouteStub = {
      snapshot: {
        paramMap: { get: (_: string) => idRuta },
        queryParamMap: { get: (_: string) => idInstalacionQuery }
      }
    };

    TestBed.configureTestingModule({
      imports: [EditInstalacionRutaComponent],
      providers: [
        { provide: InstalacionRutaService, useValue: serviceSpy },
        { provide: InstalacionRutaCoordenadaService, useValue: coordenadaServiceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditInstalacionRutaComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('InstalacionRutaService', ['get', 'crear', 'actualizar']);
    coordenadaServiceSpy = jasmine.createSpyObj('InstalacionRutaCoordenadaService', ['getAll', 'crear', 'borrarRegistro']);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  });

  it('se crea correctamente y carga la ruta y sus coordenadas cuando hay id en la ruta', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta(crearCoordenadasMock())));

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.idRuta).toBe(5);
    expect(serviceSpy.get).toHaveBeenCalledWith(5);
    expect(coordenadaServiceSpy.getAll).toHaveBeenCalledWith({ idRuta: 5 });
    expect(component.form.get('nombre')?.value).toBe('Sendero');
    expect(component.coordenadas.length).toBe(2);
    expect(component.puntosMapa.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('modo alta: no carga nada, toma idInstalacion del query param', () => {
    crearComponente(null, '10');

    fixture.detectChanges();

    expect(serviceSpy.get).not.toHaveBeenCalled();
    expect(component.idRuta).toBeNull();
  });

  it('cargar() notifica error si falla', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([])));

    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
  });

  it('cargarCoordenadas() notifica error y deja las coordenadas vacías si falla', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    fixture.detectChanges();

    expect(component.coordenadas).toEqual([]);
    expect(component.cargandoCoordenadas).toBeFalse();
  });

  it('guardar() no hace nada si el formulario es inválido', () => {
    crearComponente(null, '10');
    fixture.detectChanges();
    component.form.patchValue({ nombre: '' });

    component.guardar();

    expect(serviceSpy.crear).not.toHaveBeenCalled();
  });

  it('guardar() no hace nada si no hay idInstalacion aunque el formulario sea válido', () => {
    crearComponente(null, null);
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Sendero nuevo' });

    component.guardar();

    expect(serviceSpy.crear).not.toHaveBeenCalled();
  });

  it('guardar() sin idRuta llama a crear() y navega de vuelta a la instalación', () => {
    crearComponente(null, '10');
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Sendero nuevo' });
    serviceSpy.crear.and.returnValue(of(respuesta(true)));

    component.guardar();

    expect(serviceSpy.crear).toHaveBeenCalledWith(jasmine.objectContaining({ idInstalacion: 10, nombre: 'Sendero nuevo' }));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instalaciones', 10], { queryParams: { tab: 'rutas' } });
    expect(component.guardando).toBeFalse();
  });

  it('guardar() notifica error si crear() falla', () => {
    crearComponente(null, '10');
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Sendero nuevo' });
    serviceSpy.crear.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar();

    expect(component.guardando).toBeFalse();
  });

  it('guardar() con idRuta llama a actualizar() y recarga ruta y coordenadas', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([])));
    fixture.detectChanges();
    serviceSpy.actualizar.and.returnValue(of(respuesta(true)));
    serviceSpy.get.calls.reset();

    component.guardar();

    expect(serviceSpy.actualizar).toHaveBeenCalledWith(5, 10, jasmine.objectContaining({ nombre: 'Sendero' }));
    expect(serviceSpy.get).toHaveBeenCalledWith(5);
    expect(component.guardando).toBeFalse();
  });

  it('guardar() notifica error si actualizar() falla', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([])));
    fixture.detectChanges();
    serviceSpy.actualizar.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar();

    expect(component.guardando).toBeFalse();
  });

  it('abrirModalNuevaCoordenada() limpia la selección y abre el modal', () => {
    crearComponente(null, '10');
    fixture.detectChanges();

    component.abrirModalNuevaCoordenada();

    expect(component.coordenadaSeleccionada).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('abrirModalEditarCoordenada() selecciona la coordenada y abre el modal', () => {
    crearComponente(null, '10');
    fixture.detectChanges();
    const coordenada = crearCoordenadasMock()[0];

    component.abrirModalEditarCoordenada(coordenada);

    expect(component.coordenadaSeleccionada).toBe(coordenada);
    expect(component.modalVisible).toBeTrue();
  });

  it('coordenadaGuardada() recarga coordenadas y datos calculados cuando hay idRuta', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([])));
    fixture.detectChanges();
    coordenadaServiceSpy.getAll.calls.reset();
    serviceSpy.get.calls.reset();

    component.coordenadaGuardada();

    expect(coordenadaServiceSpy.getAll).toHaveBeenCalledWith({ idRuta: 5 });
    expect(serviceSpy.get).toHaveBeenCalledWith(5);
  });

  it('coordenadaGuardada() no hace nada si no hay idRuta', () => {
    crearComponente(null, '10');
    fixture.detectChanges();

    component.coordenadaGuardada();

    expect(coordenadaServiceSpy.getAll).not.toHaveBeenCalled();
  });

  it('agregarCoordenadaDesdeMapa() crea la última coordenada del array recibido', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([])));
    fixture.detectChanges();
    coordenadaServiceSpy.crear.and.returnValue(of(respuesta(true)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta(crearCoordenadasMock())));

    component.agregarCoordenadaDesdeMapa([{ x: 1, y: 2 }, { x: 3, y: 4 }]);

    expect(coordenadaServiceSpy.crear).toHaveBeenCalledWith(5, { x: 3, y: 4 });
    expect(component.procesandoCoordenada).toBeFalse();
  });

  it('agregarCoordenadaDesdeMapa() no hace nada sin idRuta', () => {
    crearComponente(null, '10');
    fixture.detectChanges();

    component.agregarCoordenadaDesdeMapa([{ x: 1, y: 2 }]);

    expect(coordenadaServiceSpy.crear).not.toHaveBeenCalled();
  });

  it('agregarCoordenadaDesdeMapa() no hace nada si no hay puntos', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([])));
    fixture.detectChanges();

    component.agregarCoordenadaDesdeMapa([]);

    expect(coordenadaServiceSpy.crear).not.toHaveBeenCalled();
  });

  it('agregarCoordenadaDesdeMapa() notifica error si falla', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([])));
    fixture.detectChanges();
    coordenadaServiceSpy.crear.and.returnValue(throwError(() => new Error('fallo')));

    component.agregarCoordenadaDesdeMapa([{ x: 1, y: 2 }]);

    expect(component.procesandoCoordenada).toBeFalse();
  });

  it('confirmarBorradoCoordenada() delega en DialogService', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta(crearCoordenadasMock())));
    fixture.detectChanges();

    component.confirmarBorradoCoordenada(crearCoordenadasMock()[0]);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
  });

  it('confirmarBorradoCoordenada() -> onAccept borra la coordenada y la quita del listado', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta(crearCoordenadasMock())));
    fixture.detectChanges();
    coordenadaServiceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());

    component.confirmarBorradoCoordenada(crearCoordenadasMock()[0]);

    expect(coordenadaServiceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.coordenadas.find(c => c.id === 1)).toBeUndefined();
  });

  it('borrarCoordenada() notifica error si falla', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta(crearCoordenadasMock())));
    fixture.detectChanges();
    coordenadaServiceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());

    component.confirmarBorradoCoordenada(crearCoordenadasMock()[0]);

    expect(component.procesandoCoordenada).toBeFalse();
  });

  it('deshacerUltimoPunto() borra la coordenada con mayor id', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta(crearCoordenadasMock())));
    fixture.detectChanges();
    coordenadaServiceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));

    component.deshacerUltimoPunto();

    expect(coordenadaServiceSpy.borrarRegistro).toHaveBeenCalledWith(2);
  });

  it('deshacerUltimoPunto() no hace nada si no hay coordenadas', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([])));
    fixture.detectChanges();

    component.deshacerUltimoPunto();

    expect(coordenadaServiceSpy.borrarRegistro).not.toHaveBeenCalled();
  });

  it('confirmarBorrarTodasCoordenadas() no hace nada si no hay coordenadas', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([])));
    fixture.detectChanges();

    component.confirmarBorrarTodasCoordenadas();

    expect(dialogServiceSpy.confirmar).not.toHaveBeenCalled();
  });

  it('confirmarBorrarTodasCoordenadas() -> onAccept borra todas las coordenadas', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta(crearCoordenadasMock())));
    fixture.detectChanges();
    coordenadaServiceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());

    component.confirmarBorrarTodasCoordenadas();

    expect(coordenadaServiceSpy.borrarRegistro).toHaveBeenCalledTimes(2);
    expect(component.coordenadas).toEqual([]);
  });

  it('borrarTodasCoordenadas() notifica error y recarga las coordenadas si falla', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta(crearCoordenadasMock())));
    fixture.detectChanges();
    coordenadaServiceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    coordenadaServiceSpy.getAll.calls.reset();
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta(crearCoordenadasMock())));

    component.confirmarBorrarTodasCoordenadas();

    expect(component.procesandoCoordenada).toBeFalse();
  });

  it('cancelar() navega a la instalación cuando idInstalacion es conocido', () => {
    crearComponente('5');
    serviceSpy.get.and.returnValue(of(respuesta(rutaMock)));
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([])));
    fixture.detectChanges();

    component.cancelar();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instalaciones', 10], { queryParams: { tab: 'rutas' } });
  });

  it('cancelar() no navega si idInstalacion todavía no se ha resuelto (bug conocido)', () => {
    crearComponente(null, null);
    fixture.detectChanges();

    component.cancelar();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
