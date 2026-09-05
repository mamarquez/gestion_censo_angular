import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ListProvinciaComponent } from './provincia.component';
import { ProvinciaService } from '../../../services/provincia.service';
import { DialogService } from '../../../services/dialog.service';
import { Provincia } from '../../../models/provincia';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('ListProvinciaComponent', () => {
  let component: ListProvinciaComponent;
  let fixture: ComponentFixture<ListProvinciaComponent>;
  let serviceSpy: jasmine.SpyObj<ProvinciaService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearProvinciasMock = (): Provincia[] => [
    { id: 1, ine: '11', nombre: 'Cádiz', activo: true },
    { id: 2, ine: '41', nombre: 'Sevilla', activo: false }
  ];
  let provinciasMock: Provincia[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    provinciasMock = crearProvinciasMock();
    serviceSpy = jasmine.createSpyObj('ProvinciaService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(provinciasMock)));

    await TestBed.configureTestingModule({
      imports: [ListProvinciaComponent],
      providers: [
        { provide: ProvinciaService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListProvinciaComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.provincias().length).toBe(2);
    expect(component.cargando()).toBeFalse();
  });

  it('cargar() notifica error si falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
  });

  it('buscar() aplica los filtros del formulario', () => {
    fixture.detectChanges();
    serviceSpy.getAll.calls.reset();
    component.form.patchValue({ nombre: 'Cád' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Cád' }));
    expect(component.cargando()).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.provincias()).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando()).toBeFalse();
    expect(component.provincias()).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Cád' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo de la provincia afectada', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.provincias().find(p => p.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando()).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre de la provincia', () => {
    fixture.detectChanges();
    const provincia = component.provincias().find(p => p.id === 1)!;

    component.confirmarBorrado(provincia);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Cádiz');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const provincia = component.provincias().find(p => p.id === 1)!;

    component.confirmarBorrado(provincia);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.provincias().find(p => p.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const provincia = component.provincias().find(p => p.id === 1)!;

    component.confirmarBorrado(provincia);

    expect(component.cargando()).toBeFalse();
  });

  it('abrirModal() limpia la provincia seleccionada y abre el modal', () => {
    fixture.detectChanges();
    component.provincia.set(provinciasMock[0]);

    component.abrirModal();

    expect(component.provincia()).toBeNull();
    expect(component.modalVisible()).toBeTrue();
  });

  it('editar() carga la provincia y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(provinciasMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.provincia()).toEqual(provinciasMock[0]);
    expect(component.modalVisible()).toBeTrue();
  });

  it('editar() no abre el modal si la respuesta no trae datos', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(null)));

    component.editar('1');

    expect(component.modalVisible()).toBeFalse();
  });

  it('editar() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    component.editar('1');

    expect(component.cargando()).toBeFalse();
  });

  it('guardar() sin id llama a addRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(of(respuesta(true)));
    serviceSpy.getAll.calls.reset();

    component.guardar({ ine: '14', nombre: 'Córdoba', activo: true } as Provincia);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Córdoba' }));
    expect(component.modalVisible()).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, ine: '11', nombre: 'Cádiz capital', activo: true } as Provincia);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'Cádiz capital' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ ine: '14', nombre: 'Córdoba', activo: true } as Provincia);

    expect(component.cargando()).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'Cádiz capital', activo: true } as Provincia);

    expect(component.cargando()).toBeFalse();
  });
});
