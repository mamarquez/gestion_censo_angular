import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EstadoUsoComponent } from './estadouso.component';
import { EstadoUsoService } from '../../../services/estadouso.service';
import { DialogService } from '../../../services/dialog.service';
import { EstadoUso } from '../../../models/estadouso';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('EstadoUsoComponent', () => {
  let component: EstadoUsoComponent;
  let fixture: ComponentFixture<EstadoUsoComponent>;
  let serviceSpy: jasmine.SpyObj<EstadoUsoService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearEstadosMock = (): EstadoUso[] => [
    { id: 1, nombre: 'En uso', descripcion: 'Uso habitual', activo: true },
    { id: 2, nombre: 'Fuera de servicio', descripcion: 'No operativo', activo: false }
  ];
  let estadosMock: EstadoUso[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    estadosMock = crearEstadosMock();
    serviceSpy = jasmine.createSpyObj('EstadoUsoService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(estadosMock)));

    await TestBed.configureTestingModule({
      imports: [EstadoUsoComponent],
      providers: [
        { provide: EstadoUsoService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EstadoUsoComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.estadosUsos.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('cargar() notifica error si falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
  });

  it('buscar() aplica los filtros del formulario', () => {
    fixture.detectChanges();
    serviceSpy.getAll.calls.reset();
    component.form.patchValue({ nombre: 'En uso' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'En uso' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.estadosUsos).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.estadosUsos).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'En uso' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo afectado', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.estadosUsos.find(e => e.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre del estado de uso', () => {
    fixture.detectChanges();
    const estado = component.estadosUsos.find(e => e.id === 1)!;

    component.confirmarBorrado(estado);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('En uso');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const estado = component.estadosUsos.find(e => e.id === 1)!;

    component.confirmarBorrado(estado);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.estadosUsos.find(e => e.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const estado = component.estadosUsos.find(e => e.id === 1)!;

    component.confirmarBorrado(estado);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia el estado de uso seleccionado y abre el modal', () => {
    fixture.detectChanges();
    component.estadoUso = estadosMock[0];

    component.abrirModal();

    expect(component.estadoUso).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga el estado de uso y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(estadosMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.estadoUso).toEqual(estadosMock[0]);
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    component.editar('1');

    expect(component.cargando).toBeFalse();
  });

  it('guardar() sin id llama a addRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(of(respuesta(true)));
    serviceSpy.getAll.calls.reset();

    component.guardar({ nombre: 'Nuevo estado', descripcion: 'desc', activo: true } as EstadoUso);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Nuevo estado' }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, nombre: 'En uso renombrado', activo: true } as EstadoUso);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'En uso renombrado' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'Nuevo estado', activo: true } as EstadoUso);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'En uso renombrado', activo: true } as EstadoUso);

    expect(component.cargando).toBeFalse();
  });
});
