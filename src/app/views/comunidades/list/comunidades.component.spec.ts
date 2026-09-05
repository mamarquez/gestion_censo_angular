import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ListComunidadesComponent } from './comunidades.component';
import { ComunidadautonomaService } from '../../../services/comunidadautonoma.service';
import { DialogService } from '../../../services/dialog.service';
import { ComunidadAutonoma } from '../../../models/comunidadautonoma';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('ListComunidadesComponent', () => {
  let component: ListComunidadesComponent;
  let fixture: ComponentFixture<ListComunidadesComponent>;
  let serviceSpy: jasmine.SpyObj<ComunidadautonomaService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearComunidadesMock = (): ComunidadAutonoma[] => [
    { id: 1, codigo: '01', nombre: 'Andalucía', activo: true },
    { id: 2, codigo: '09', nombre: 'Cataluña', activo: false }
  ];
  let comunidadesMock: ComunidadAutonoma[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    comunidadesMock = crearComunidadesMock();
    serviceSpy = jasmine.createSpyObj('ComunidadautonomaService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(comunidadesMock)));

    await TestBed.configureTestingModule({
      imports: [ListComunidadesComponent],
      providers: [
        { provide: ComunidadautonomaService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComunidadesComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.comunidades.length).toBe(2);
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
    component.form.patchValue({ nombre: 'Andal' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Andal' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.comunidades).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.comunidades).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Andal' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo de la comunidad afectada', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.comunidades.find(c => c.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre de la comunidad', () => {
    fixture.detectChanges();
    const comunidad = component.comunidades.find(c => c.id === 1)!;

    component.confirmarBorrado(comunidad);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Andalucía');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const comunidad = component.comunidades.find(c => c.id === 1)!;

    component.confirmarBorrado(comunidad);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.comunidades.find(c => c.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const comunidad = component.comunidades.find(c => c.id === 1)!;

    component.confirmarBorrado(comunidad);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia la comunidad seleccionada y abre el modal', () => {
    fixture.detectChanges();
    component.comunidad = comunidadesMock[0];

    component.abrirModal();

    expect(component.comunidad).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga la comunidad y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(comunidadesMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.comunidad).toEqual(comunidadesMock[0]);
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

    component.guardar({ codigo: '12', nombre: 'Galicia', activo: true } as ComunidadAutonoma);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Galicia' }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, codigo: '01', nombre: 'Andalucía renombrada', activo: true } as ComunidadAutonoma);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'Andalucía renombrada' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ codigo: '12', nombre: 'Galicia', activo: true } as ComunidadAutonoma);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'Andalucía renombrada', activo: true } as ComunidadAutonoma);

    expect(component.cargando).toBeFalse();
  });
});
