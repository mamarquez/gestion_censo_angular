import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ConservacionComponent } from './conservacion.component';
import { ConservacionService } from '../../../services/conservacion.service';
import { DialogService } from '../../../services/dialog.service';
import { Conservacion } from '../../../models/conservacion';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('ConservacionComponent', () => {
  let component: ConservacionComponent;
  let fixture: ComponentFixture<ConservacionComponent>;
  let serviceSpy: jasmine.SpyObj<ConservacionService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearConservacionesMock = (): Conservacion[] => [
    { id: 1, nombre: 'Buen estado', descripcion: 'Sin incidencias', activo: true },
    { id: 2, nombre: 'Regular', descripcion: 'Con desperfectos', activo: false }
  ];
  let conservacionesMock: Conservacion[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    conservacionesMock = crearConservacionesMock();
    serviceSpy = jasmine.createSpyObj('ConservacionService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(conservacionesMock)));

    await TestBed.configureTestingModule({
      imports: [ConservacionComponent],
      providers: [
        { provide: ConservacionService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConservacionComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.conservaciones.length).toBe(2);
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
    component.form.patchValue({ nombre: 'Buen' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Buen' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.conservaciones).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.conservaciones).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Buen' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo de la conservación afectada', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.conservaciones.find(c => c.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre de la conservación', () => {
    fixture.detectChanges();
    const conservacion = component.conservaciones.find(c => c.id === 1)!;

    component.confirmarBorrado(conservacion);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Buen estado');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const conservacion = component.conservaciones.find(c => c.id === 1)!;

    component.confirmarBorrado(conservacion);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.conservaciones.find(c => c.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const conservacion = component.conservaciones.find(c => c.id === 1)!;

    component.confirmarBorrado(conservacion);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia la conservación seleccionada y abre el modal', () => {
    fixture.detectChanges();
    component.conservacion = conservacionesMock[0];

    component.abrirModal();

    expect(component.conservacion).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga la conservación y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(conservacionesMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.conservacion).toEqual(conservacionesMock[0]);
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() no abre el modal si la respuesta no trae datos', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(null)));

    component.editar('1');

    expect(component.modalVisible).toBeFalse();
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

    component.guardar({ nombre: 'Nueva conservación', descripcion: 'desc', activo: true } as Conservacion);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Nueva conservación' }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, nombre: 'Buen estado renombrado', activo: true } as Conservacion);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'Buen estado renombrado' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'Nueva conservación', activo: true } as Conservacion);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'Buen estado renombrado', activo: true } as Conservacion);

    expect(component.cargando).toBeFalse();
  });
});
