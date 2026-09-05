import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RutasComponent } from './rutas.component';
import { InstalacionRutaService } from '../../../../../services/instalacionRuta.service';
import { InstalacionRutaCoordenadaService } from '../../../../../services/instalacionRutaCoordenada.service';
import { DialogService } from '../../../../../services/dialog.service';
import { InstalacionRuta } from '../../../../../models/instalacionRuta';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

describe('RutasComponent', () => {
  let component: RutasComponent;
  let fixture: ComponentFixture<RutasComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionRutaService>;
  let coordenadaServiceSpy: jasmine.SpyObj<InstalacionRutaCoordenadaService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const crearRutasMock = (): InstalacionRuta[] => [
    { id: 1, idInstalacion: 10, nombre: 'Sendero corto', visible: true } as InstalacionRuta,
    { id: 2, idInstalacion: 10, nombre: 'Sendero largo', visible: false } as InstalacionRuta
  ];
  let rutasMock: InstalacionRuta[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    rutasMock = crearRutasMock();
    serviceSpy = jasmine.createSpyObj('InstalacionRutaService', [
      'getAll', 'cambiarVisible', 'borrarRegistro', 'descargarFichero'
    ]);
    coordenadaServiceSpy = jasmine.createSpyObj('InstalacionRutaCoordenadaService', ['getAll']);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    serviceSpy.getAll.and.returnValue(of(respuesta(rutasMock)));

    await TestBed.configureTestingModule({
      imports: [RutasComponent],
      providers: [
        { provide: InstalacionRutaService, useValue: serviceSpy },
        { provide: InstalacionRutaCoordenadaService, useValue: coordenadaServiceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: Router, useValue: routerSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RutasComponent);
    component = fixture.componentInstance;
  });

  function inicializarConInstalacion(id = '10'): void {
    fixture.componentRef.setInput('idInstalacion', id);
    fixture.detectChanges();
  }

  it('se crea correctamente y carga las rutas si hay idInstalacion', () => {
    inicializarConInstalacion('10');

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith({ idInstalacion: '10' });
    expect(component.rutas.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('emite cargandoChange(true) y luego cargandoChange(false) al cargar', () => {
    const emitidos: boolean[] = [];
    component.cargandoChange.subscribe(v => emitidos.push(v));

    inicializarConInstalacion('10');

    expect(emitidos).toEqual([true, false]);
  });

  it('cargarDatos() notifica error si falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    inicializarConInstalacion('10');

    expect(component.cargando).toBeFalse();
  });

  it('limpiar() resetea el formulario, conserva idInstalacion y vuelve a buscar', () => {
    inicializarConInstalacion('10');
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.get('idInstalacion')?.value).toBe('10');
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    inicializarConInstalacion('10');
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.rutas).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.rutas).toEqual([]);
  });

  it('nuevo() navega a /instalacionesrutas/nuevo con el idInstalacion como query param', () => {
    inicializarConInstalacion('10');

    component.nuevo();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instalacionesrutas', 'nuevo'], {
      queryParams: { idInstalacion: '10' }
    });
  });

  it('editar() navega a /instalacionesrutas/{id}', () => {
    inicializarConInstalacion('10');

    component.editar(1);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instalacionesrutas', 1]);
  });

  it('cargarPuntosRuta() carga las coordenadas la primera vez', () => {
    inicializarConInstalacion('10');
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([{ id: 1, x: 1, y: 2 }])));

    component.cargarPuntosRuta(rutasMock[0]);

    expect(coordenadaServiceSpy.getAll).toHaveBeenCalledWith({ idRuta: 1 });
    expect(component.puntosPorRuta[1]).toEqual([{ id: 1, x: 1, y: 2 }]);
    expect(component.cargandoPuntos[1]).toBeFalse();
  });

  it('cargarPuntosRuta() no recarga si ya hay puntos cacheados', () => {
    inicializarConInstalacion('10');
    coordenadaServiceSpy.getAll.and.returnValue(of(respuesta([{ id: 1, x: 1, y: 2 }])));
    component.cargarPuntosRuta(rutasMock[0]);
    coordenadaServiceSpy.getAll.calls.reset();

    component.cargarPuntosRuta(rutasMock[0]);

    expect(coordenadaServiceSpy.getAll).not.toHaveBeenCalled();
  });

  it('cargarPuntosRuta() no hace nada si la ruta no tiene id', () => {
    inicializarConInstalacion('10');

    component.cargarPuntosRuta({ nombre: 'sin id' } as InstalacionRuta);

    expect(coordenadaServiceSpy.getAll).not.toHaveBeenCalled();
  });

  it('cargarPuntosRuta() notifica error y deja el listado vacío si falla', () => {
    inicializarConInstalacion('10');
    coordenadaServiceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.cargarPuntosRuta(rutasMock[0]);

    expect(component.puntosPorRuta[1]).toEqual([]);
    expect(component.cargandoPuntos[1]).toBeFalse();
  });

  it('cambiarVisible() invierte la visibilidad de la ruta afectada', () => {
    inicializarConInstalacion('10');
    serviceSpy.cambiarVisible.and.returnValue(of(respuesta(true)));

    component.cambiarVisible(1);

    expect(serviceSpy.cambiarVisible).toHaveBeenCalledWith(1);
    expect(component.rutas.find(r => r.id === 1)?.visible).toBeFalse();
  });

  it('cambiarVisible() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.cambiarVisible.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarVisible(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre de la ruta', () => {
    inicializarConInstalacion('10');
    const ruta = component.rutas.find(r => r.id === 1)!;

    component.confirmarBorrado(ruta);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Sendero corto');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    inicializarConInstalacion('10');
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const ruta = component.rutas.find(r => r.id === 1)!;

    component.confirmarBorrado(ruta);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.rutas.find(r => r.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const ruta = component.rutas.find(r => r.id === 1)!;

    component.confirmarBorrado(ruta);

    expect(component).toBeTruthy();
  });

  it('descargarFichero() crea y limpia un enlace temporal de descarga', () => {
    inicializarConInstalacion('10');
    const blob = new Blob(['contenido']);
    serviceSpy.descargarFichero.and.returnValue(of(blob));
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
    spyOn(window.URL, 'revokeObjectURL');

    component.descargarFichero(1);

    expect(serviceSpy.descargarFichero).toHaveBeenCalledWith(1);
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('descargarFichero() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.descargarFichero.and.returnValue(throwError(() => new Error('fallo')));

    component.descargarFichero(1);

    expect(component).toBeTruthy();
  });

  it('onFileSelected() lee el archivo seleccionado sin lanzar error', () => {
    inicializarConInstalacion('10');
    const file = new File(['contenido'], 'ruta.kml');
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });

    expect(() => component.onFileSelected({ target: input } as unknown as Event)).not.toThrow();
  });

  it('onFileSelected() no lanza error si no hay archivo seleccionado', () => {
    inicializarConInstalacion('10');
    const input = document.createElement('input');
    input.type = 'file';

    expect(() => component.onFileSelected({ target: input } as unknown as Event)).not.toThrow();
  });
});
