import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PropietarioComponent } from './propietario.component';
import { PropietarioService } from '../../../services/propietario.service';
import { DialogService } from '../../../services/dialog.service';
import { Propietario } from '../../../models/propietario';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('PropietarioComponent', () => {
  let component: PropietarioComponent;
  let fixture: ComponentFixture<PropietarioComponent>;
  let serviceSpy: jasmine.SpyObj<PropietarioService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearPropietariosMock = (): Propietario[] => [
    { id: 1, nombre: 'Ayuntamiento', descripcion: 'Público', visible: true, activo: true },
    { id: 2, nombre: 'Diputación', descripcion: 'Público', visible: false, activo: false }
  ];
  let propietariosMock: Propietario[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    propietariosMock = crearPropietariosMock();
    serviceSpy = jasmine.createSpyObj('PropietarioService', [
      'getAll', 'get', 'cambiarEstado', 'cambiarVisible', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(propietariosMock)));

    await TestBed.configureTestingModule({
      imports: [PropietarioComponent],
      providers: [
        { provide: PropietarioService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PropietarioComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.propietarios.length).toBe(2);
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
    component.form.patchValue({ nombre: 'Ayunt' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Ayunt' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.propietarios).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.propietarios).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Ayunt' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarVisible() invierte la visibilidad del propietario afectado', () => {
    fixture.detectChanges();
    serviceSpy.cambiarVisible.and.returnValue(of(respuesta(true)));

    component.cambiarVisible(1);

    expect(serviceSpy.cambiarVisible).toHaveBeenCalledWith(1);
    expect(component.propietarios.find(p => p.id === 1)?.visible).toBeFalse();
  });

  it('cambiarVisible() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarVisible.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarVisible(1);

    expect(component.cargando).toBeFalse();
  });

  it('cambiarEstado() invierte el estado activo del propietario afectado', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.propietarios.find(p => p.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre del propietario', () => {
    fixture.detectChanges();
    const propietario = component.propietarios.find(p => p.id === 1)!;

    component.confirmarBorrado(propietario);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Ayuntamiento');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const propietario = component.propietarios.find(p => p.id === 1)!;

    component.confirmarBorrado(propietario);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.propietarios.find(p => p.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const propietario = component.propietarios.find(p => p.id === 1)!;

    component.confirmarBorrado(propietario);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia el propietario seleccionado y abre el modal', () => {
    fixture.detectChanges();
    component.propietario = propietariosMock[0];

    component.abrirModal();

    expect(component.propietario).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga el propietario y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(propietariosMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.propietario).toEqual(propietariosMock[0]);
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

    component.guardar({ nombre: 'Nuevo propietario', descripcion: 'desc', visible: true, activo: true } as Propietario);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Nuevo propietario' }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, nombre: 'Ayuntamiento renombrado', visible: true, activo: true } as Propietario);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'Ayuntamiento renombrado' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'Nuevo propietario', activo: true } as Propietario);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'Ayuntamiento renombrado', activo: true } as Propietario);

    expect(component.cargando).toBeFalse();
  });
});
