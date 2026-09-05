import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TiposGestoresPropiedadesComponent } from './tiposgestorespropiedades.component';
import { TipoGestorPropiedadService } from '../../../services/tipogestorpropiedad.service';
import { DialogService } from '../../../services/dialog.service';
import { TipoGestorPropiedad } from '../../../models/TipoGestorPropiedad';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('TiposGestoresPropiedadesComponent', () => {
  let component: TiposGestoresPropiedadesComponent;
  let fixture: ComponentFixture<TiposGestoresPropiedadesComponent>;
  let serviceSpy: jasmine.SpyObj<TipoGestorPropiedadService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearTiposMock = (): TipoGestorPropiedad[] => [
    { id: 1, nombre: 'Público', mostrar: 'Público', activo: true },
    { id: 2, nombre: 'Privado', mostrar: 'Privado', activo: false }
  ];
  let tiposMock: TipoGestorPropiedad[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    tiposMock = crearTiposMock();
    serviceSpy = jasmine.createSpyObj('TipoGestorPropiedadService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(tiposMock)));

    await TestBed.configureTestingModule({
      imports: [TiposGestoresPropiedadesComponent],
      providers: [
        { provide: TipoGestorPropiedadService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TiposGestoresPropiedadesComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.tiposGestoresPropiedades.length).toBe(2);
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
    component.form.patchValue({ nombre: 'Púb' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Púb' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.tiposGestoresPropiedades).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.tiposGestoresPropiedades).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Púb' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo del tipo afectado', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.tiposGestoresPropiedades.find(t => t.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre del tipo', () => {
    fixture.detectChanges();
    const tipo = component.tiposGestoresPropiedades.find(t => t.id === 1)!;

    component.confirmarBorrado(tipo);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Público');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const tipo = component.tiposGestoresPropiedades.find(t => t.id === 1)!;

    component.confirmarBorrado(tipo);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.tiposGestoresPropiedades.find(t => t.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const tipo = component.tiposGestoresPropiedades.find(t => t.id === 1)!;

    component.confirmarBorrado(tipo);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia el tipo seleccionado y abre el modal', () => {
    fixture.detectChanges();
    component.tipoGestorPropiedad = tiposMock[0];

    component.abrirModal();

    expect(component.tipoGestorPropiedad).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga el tipo y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(tiposMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.tipoGestorPropiedad).toEqual(tiposMock[0]);
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

    component.guardar({ nombre: 'Nuevo tipo', mostrar: 'Nuevo', activo: true } as TipoGestorPropiedad);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Nuevo tipo' }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, nombre: 'Público renombrado', mostrar: 'Público', activo: true } as TipoGestorPropiedad);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'Público renombrado' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'Nuevo tipo', activo: true } as TipoGestorPropiedad);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'Público renombrado', activo: true } as TipoGestorPropiedad);

    expect(component.cargando).toBeFalse();
  });
});
