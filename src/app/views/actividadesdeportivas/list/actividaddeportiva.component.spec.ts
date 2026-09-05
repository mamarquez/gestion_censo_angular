import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ActividadDeportivaComponent } from './actividaddeportiva.component';
import { ActividadDeportivaService } from '../../../services/adtividaddeportiva.service';
import { DialogService } from '../../../services/dialog.service';
import { ActividadDeportiva } from '../../../models/actividaddeportiva';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('ActividadDeportivaComponent', () => {
  let component: ActividadDeportivaComponent;
  let fixture: ComponentFixture<ActividadDeportivaComponent>;
  let serviceSpy: jasmine.SpyObj<ActividadDeportivaService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearActividadesMock = (): ActividadDeportiva[] => [
    { id: 1, nombre: 'Fútbol', descripcion: 'Deporte de equipo', activo: true },
    { id: 2, nombre: 'Baloncesto', descripcion: 'Deporte de equipo', activo: false }
  ];
  let actividadesMock: ActividadDeportiva[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    actividadesMock = crearActividadesMock();
    serviceSpy = jasmine.createSpyObj('ActividadDeportivaService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(actividadesMock)));

    await TestBed.configureTestingModule({
      imports: [ActividadDeportivaComponent],
      providers: [
        { provide: ActividadDeportivaService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActividadDeportivaComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.actividadesDeportivas.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('cargar() marca cargando=false y vacía el listado si falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
    expect(component.actividadesDeportivas).toEqual([]);
  });

  it('buscar() aplica los filtros del formulario', () => {
    fixture.detectChanges();
    serviceSpy.getAll.calls.reset();
    component.form.patchValue({ nombre: 'Fút' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Fút' }));
    expect(component.actividadesDeportivas.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.actividadesDeportivas).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.actividadesDeportivas).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Fút' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo de la actividad afectada', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.actividadesDeportivas.find(a => a.id === 1)?.activo).toBeFalse();
    expect(component.cargando).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre de la actividad', () => {
    fixture.detectChanges();
    const actividad = component.actividadesDeportivas.find(a => a.id === 1)!;

    component.confirmarBorrado(actividad);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Fútbol');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const actividad = component.actividadesDeportivas.find(a => a.id === 1)!;

    component.confirmarBorrado(actividad);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.actividadesDeportivas.find(a => a.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const actividad = component.actividadesDeportivas.find(a => a.id === 1)!;

    component.confirmarBorrado(actividad);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia la actividad seleccionada y abre el modal', () => {
    fixture.detectChanges();
    component.actividadDeportiva = actividadesMock[0];

    component.abrirModal();

    expect(component.actividadDeportiva).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga la actividad y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(actividadesMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.actividadDeportiva).toEqual(actividadesMock[0]);
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

    component.guardar({ nombre: 'Natación', descripcion: 'Individual', activo: true } as ActividadDeportiva);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Natación' }));
    expect(component.modalVisible).toBeFalse();
    expect(component.cargando).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, nombre: 'Fútbol sala', descripcion: 'Deporte de equipo', activo: true } as ActividadDeportiva);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'Fútbol sala' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'Natación', activo: true } as ActividadDeportiva);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'Fútbol sala', activo: true } as ActividadDeportiva);

    expect(component.cargando).toBeFalse();
  });
});
