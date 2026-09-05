import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { IluminacionComponent } from './iluminacion.component';
import { IluminacionService } from '../../../services/iluminacion.service';
import { DialogService } from '../../../services/dialog.service';
import { Iluminacion } from '../../../models/iluminacion';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('IluminacionComponent', () => {
  let component: IluminacionComponent;
  let fixture: ComponentFixture<IluminacionComponent>;
  let serviceSpy: jasmine.SpyObj<IluminacionService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearIluminacionesMock = (): Iluminacion[] => [
    { id: 1, nombre: 'LED', descripcion: 'Bajo consumo', activo: true },
    { id: 2, nombre: 'Halógena', descripcion: 'Alto consumo', activo: false }
  ];
  let iluminacionesMock: Iluminacion[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    iluminacionesMock = crearIluminacionesMock();
    serviceSpy = jasmine.createSpyObj('IluminacionService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(iluminacionesMock)));

    await TestBed.configureTestingModule({
      imports: [IluminacionComponent],
      providers: [
        { provide: IluminacionService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IluminacionComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.iluminaciones.length).toBe(2);
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
    component.form.patchValue({ nombre: 'LED' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'LED' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.iluminaciones).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.iluminaciones).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'LED' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo de la iluminación afectada', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.iluminaciones.find(i => i.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre de la iluminación', () => {
    fixture.detectChanges();
    const iluminacion = component.iluminaciones.find(i => i.id === 1)!;

    component.confirmarBorrado(iluminacion);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('LED');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const iluminacion = component.iluminaciones.find(i => i.id === 1)!;

    component.confirmarBorrado(iluminacion);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.iluminaciones.find(i => i.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const iluminacion = component.iluminaciones.find(i => i.id === 1)!;

    component.confirmarBorrado(iluminacion);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia la iluminación seleccionada y abre el modal', () => {
    fixture.detectChanges();
    component.iluminacion = iluminacionesMock[0];

    component.abrirModal();

    expect(component.iluminacion).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga la iluminación y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(iluminacionesMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.iluminacion).toEqual(iluminacionesMock[0]);
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

    component.guardar({ nombre: 'Fluorescente', descripcion: 'desc', activo: true } as Iluminacion);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Fluorescente' }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, nombre: 'LED renombrado', activo: true } as Iluminacion);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'LED renombrado' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'Fluorescente', activo: true } as Iluminacion);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'LED renombrado', activo: true } as Iluminacion);

    expect(component.cargando).toBeFalse();
  });
});
