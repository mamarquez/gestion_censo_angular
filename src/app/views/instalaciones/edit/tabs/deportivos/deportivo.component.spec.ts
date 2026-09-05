import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DatosEspaciosDeportivosComponent } from './deportivo.component';
import { InstalacionEspacioDeportivoService } from '../../../../../services/instalacionEspacioDeportivo.service';
import { DialogService } from '../../../../../services/dialog.service';
import { InstalacionEspacioDeportivo } from '../../../../../models/instalacionEspacioDeportivo';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

describe('DatosEspaciosDeportivosComponent', () => {
  let component: DatosEspaciosDeportivosComponent;
  let fixture: ComponentFixture<DatosEspaciosDeportivosComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionEspacioDeportivoService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearEspaciosMock = (): InstalacionEspacioDeportivo[] => [
    { id: 1, instalacion: { id: 10 } as any, nombre: 'Pista de pádel', descripcion: 'Cubierta', visible: true },
    { id: 2, instalacion: { id: 10 } as any, nombre: 'Campo de fútbol', descripcion: 'Césped', visible: false }
  ];
  let espaciosMock: InstalacionEspacioDeportivo[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    espaciosMock = crearEspaciosMock();
    serviceSpy = jasmine.createSpyObj('InstalacionEspacioDeportivoService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'crear', 'update'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(espaciosMock)));

    await TestBed.configureTestingModule({
      imports: [DatosEspaciosDeportivosComponent],
      providers: [
        { provide: InstalacionEspacioDeportivoService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService,
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatosEspaciosDeportivosComponent);
    component = fixture.componentInstance;
  });

  function inicializarConInstalacion(id = '10'): void {
    fixture.componentRef.setInput('idInstalacion', id);
    fixture.detectChanges();
  }

  it('se crea correctamente', () => {
    inicializarConInstalacion();
    expect(component).toBeTruthy();
  });

  it('carga los espacios deportivos de la instalación al iniciar', () => {
    inicializarConInstalacion('10');

    expect(serviceSpy.getAll).toHaveBeenCalledWith({ idInstalacion: '10' });
    expect(component.espaciosDeportivos.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('emite cargandoChange(true) y luego cargandoChange(false) al cargar', () => {
    const emitidos: boolean[] = [];
    component.cargandoChange.subscribe(v => emitidos.push(v));

    inicializarConInstalacion('10');

    expect(emitidos).toEqual([true, false]);
  });

  it('marca cargando=false y notifica error si falla la carga', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    inicializarConInstalacion('10');

    expect(component.cargando).toBeFalse();
    expect(component.espaciosDeportivos).toEqual([]);
  });

  it('cambiarVisible() invierte la visibilidad del espacio deportivo afectado', () => {
    inicializarConInstalacion('10');
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarVisible(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.espaciosDeportivos.find(e => e.id === 1)?.visible).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre del espacio deportivo', () => {
    inicializarConInstalacion('10');
    const espacio = component.espaciosDeportivos.find(e => e.id === 1)!;

    component.confirmarBorrado(espacio as any);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Pista de pádel');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    inicializarConInstalacion('10');
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const espacio = component.espaciosDeportivos.find(e => e.id === 1)!;

    component.confirmarBorrado(espacio as any);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.espaciosDeportivos.find(e => e.id === 1)).toBeUndefined();
  });

  it('editar() carga el espacio deportivo y abre el modal', () => {
    inicializarConInstalacion('10');
    serviceSpy.get.and.returnValue(of(respuesta(espaciosMock[0])));

    component.editar(1);

    expect(serviceSpy.get).toHaveBeenCalledWith(1);
    expect(component.espacioDeportivo).toEqual(espaciosMock[0]);
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() no abre el modal si la respuesta no trae datos', () => {
    inicializarConInstalacion('10');
    serviceSpy.get.and.returnValue(of(respuesta(null)));

    component.editar(1);

    expect(component.modalVisible).toBeFalse();
  });

  it('abrirModal() limpia el espacio deportivo seleccionado y abre el modal', () => {
    inicializarConInstalacion('10');
    component.espacioDeportivo = espaciosMock[0] as any;

    component.abrirModal();

    expect(component.espacioDeportivo).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('guardar() sin id llama a crear() con la instalación reconstruida a partir de idInstalacion', () => {
    inicializarConInstalacion('10');
    serviceSpy.crear.and.returnValue(of(respuesta(true)));
    serviceSpy.getAll.calls.reset();

    component.guardar({ nombre: 'Pista nueva', descripcion: 'desc', visible: true });

    expect(serviceSpy.crear).toHaveBeenCalledWith(jasmine.objectContaining({
      instalacion: { id: 10 },
      nombre: 'Pista nueva'
    }));
    expect(component.modalVisible).toBeFalse();
    expect(component.guardando).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a update() con el id numérico', () => {
    inicializarConInstalacion('10');
    serviceSpy.update.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, nombre: 'Pista renombrada', visible: true });

    expect(serviceSpy.update).toHaveBeenCalledWith(1, jasmine.objectContaining({ nombre: 'Pista renombrada' }));
  });

  it('guardar() notifica error si el servicio falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.crear.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'Pista nueva', visible: true });

    expect(component.guardando).toBeFalse();
  });
});
