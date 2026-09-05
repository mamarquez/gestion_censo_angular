import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { MenuComponent } from './menu.component';
import { MenuService } from '../../../services/menu.service';
import { DialogService } from '../../../services/dialog.service';
import { Menu } from '../../../models/menu';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let serviceSpy: jasmine.SpyObj<MenuService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearMenusMock = (): Menu[] => [
    { id: 1, nombre: 'Instalaciones', enlace: '/instalaciones', visible: true, activo: true },
    { id: 2, nombre: 'Usuarios', enlace: '/usuarios', visible: false, activo: false }
  ];
  let menusMock: Menu[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    menusMock = crearMenusMock();
    serviceSpy = jasmine.createSpyObj('MenuService', [
      'getAll', 'get', 'cambiarEstado', 'cambiarVisible', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(menusMock)));

    await TestBed.configureTestingModule({
      imports: [MenuComponent],
      providers: [
        { provide: MenuService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.menus.length).toBe(2);
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
    component.form.patchValue({ nombre: 'Instal' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Instal' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.menus).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.menus).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Instal' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarVisible() invierte la visibilidad del menú afectado', () => {
    fixture.detectChanges();
    serviceSpy.cambiarVisible.and.returnValue(of(respuesta(true)));

    component.cambiarVisible(1);

    expect(serviceSpy.cambiarVisible).toHaveBeenCalledWith(1);
    expect(component.menus.find(m => m.id === 1)?.visible).toBeFalse();
  });

  it('cambiarVisible() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarVisible.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarVisible(1);

    expect(component.cargando).toBeFalse();
  });

  it('cambiarEstado() invierte el estado activo del menú afectado', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.menus.find(m => m.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre del menú', () => {
    fixture.detectChanges();
    const menu = component.menus.find(m => m.id === 1)!;

    component.confirmarBorrado(menu);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Instalaciones');
  });

  it('confirmarBorrado() -> onAccept borra el registro (convertido a número) y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const menu = component.menus.find(m => m.id === 1)!;

    component.confirmarBorrado(menu);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.menus.find(m => m.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const menu = component.menus.find(m => m.id === 1)!;

    component.confirmarBorrado(menu);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia el menú seleccionado y abre el modal', () => {
    fixture.detectChanges();
    component.menu = menusMock[0];

    component.abrirModal();

    expect(component.menu).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga el menú y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(menusMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.menu).toEqual(menusMock[0]);
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

    component.guardar({ nombre: 'Nuevo menú', enlace: '/nuevo', visible: true, activo: true } as Menu);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Nuevo menú' }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, nombre: 'Instalaciones renombrado', enlace: '/instalaciones', visible: true, activo: true } as Menu);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'Instalaciones renombrado' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'Nuevo menú', visible: true, activo: true } as Menu);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'Instalaciones renombrado', visible: true, activo: true } as Menu);

    expect(component.cargando).toBeFalse();
  });
});
