import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { UsuarioComponent } from './usuario.component';
import { UsuarioService } from '../../../services/usuario.service';
import { DialogService } from '../../../services/dialog.service';
import { UsuarioModel } from '../../../models/usuario-model';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('UsuarioComponent', () => {
  let component: UsuarioComponent;
  let fixture: ComponentFixture<UsuarioComponent>;
  let serviceSpy: jasmine.SpyObj<UsuarioService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const crearUsuariosMock = (): UsuarioModel[] => [
    { id: 'u1', nombreUsuario: 'jperez', nombre: 'Juan', apellido1: 'Pérez', activo: true, email: 'juan@x.com', roles: [] },
    { id: 'u2', nombreUsuario: 'mlopez', nombre: 'María', apellido1: 'López', activo: false, email: 'maria@x.com', roles: [] }
  ];
  let usuariosMock: UsuarioModel[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    usuariosMock = crearUsuariosMock();
    serviceSpy = jasmine.createSpyObj('UsuarioService', [
      'getAll', 'cambiarEstado', 'borrarRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    serviceSpy.getAll.and.returnValue(of(respuesta(usuariosMock)));

    await TestBed.configureTestingModule({
      imports: [UsuarioComponent],
      providers: [
        { provide: UsuarioService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: Router, useValue: routerSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.usuarios.length).toBe(2);
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
    component.form.patchValue({ nombre: 'Juan' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Juan' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.usuarios).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.usuarios).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Juan' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo del usuario afectado', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado('u1');

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith('u1');
    expect(component.usuarios.find(u => u.id === 'u1')?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado('u1');

    expect(component.cargando).toBeFalse();
  });

  it('nuevo() navega a /usuarios/nuevo', () => {
    fixture.detectChanges();

    component.nuevo();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/usuarios', 'nuevo']);
  });

  it('editar() navega a /usuarios/{id}', () => {
    fixture.detectChanges();

    component.editar('u1');

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/usuarios', 'u1']);
  });

  it('confirmarBorrado() delega en DialogService con el nombre del usuario', () => {
    fixture.detectChanges();
    const usuario = component.usuarios.find(u => u.id === 'u1')!;

    component.confirmarBorrado(usuario);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Juan');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const usuario = component.usuarios.find(u => u.id === 'u1')!;

    component.confirmarBorrado(usuario);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith('u1');
    expect(component.usuarios.find(u => u.id === 'u1')).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const usuario = component.usuarios.find(u => u.id === 'u1')!;

    component.confirmarBorrado(usuario);

    expect(component.cargando).toBeFalse();
  });
});
