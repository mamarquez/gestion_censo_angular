import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { NivelEnergeticoComponent } from './nivelenergetico.component';
import { NivelEnergeticoService } from '../../../services/nivelenergetico.service';
import { DialogService } from '../../../services/dialog.service';
import { NivelEnergetico } from '../../../models/nivelenergetico';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('NivelEnergeticoComponent', () => {
  let component: NivelEnergeticoComponent;
  let fixture: ComponentFixture<NivelEnergeticoComponent>;
  let serviceSpy: jasmine.SpyObj<NivelEnergeticoService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearNivelesMock = (): NivelEnergetico[] => [
    { id: 1, nombre: 'A', descripcion: 'Eficiencia alta', activo: true },
    { id: 2, nombre: 'G', descripcion: 'Eficiencia baja', activo: false }
  ];
  let nivelesMock: NivelEnergetico[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    nivelesMock = crearNivelesMock();
    serviceSpy = jasmine.createSpyObj('NivelEnergeticoService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(nivelesMock)));

    await TestBed.configureTestingModule({
      imports: [NivelEnergeticoComponent],
      providers: [
        { provide: NivelEnergeticoService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NivelEnergeticoComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.nivelesEnergeticos.length).toBe(2);
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
    component.form.patchValue({ nombre: 'A' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'A' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.nivelesEnergeticos).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.nivelesEnergeticos).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'A' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo del nivel afectado', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.nivelesEnergeticos.find(n => n.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre del nivel', () => {
    fixture.detectChanges();
    const nivel = component.nivelesEnergeticos.find(n => n.id === 1)!;

    component.confirmarBorrado(nivel as any);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('A');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const nivel = component.nivelesEnergeticos.find(n => n.id === 1)!;

    component.confirmarBorrado(nivel as any);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.nivelesEnergeticos.find(n => n.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const nivel = component.nivelesEnergeticos.find(n => n.id === 1)!;

    component.confirmarBorrado(nivel as any);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia el nivel seleccionado y abre el modal', () => {
    fixture.detectChanges();
    component.nivelEnergetico = nivelesMock[0];

    component.abrirModal();

    expect(component.nivelEnergetico).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga el nivel y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(nivelesMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.nivelEnergetico).toEqual(nivelesMock[0]);
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

    component.guardar({ nombre: 'B', descripcion: 'desc', activo: true } as NivelEnergetico);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'B' }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, nombre: 'A+', activo: true } as NivelEnergetico);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'A+' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'B', activo: true } as NivelEnergetico);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'A+', activo: true } as NivelEnergetico);

    expect(component.cargando).toBeFalse();
  });
});
