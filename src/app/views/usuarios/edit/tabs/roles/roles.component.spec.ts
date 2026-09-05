import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RolesComponent } from './roles.component';
import { RolService } from '../../../../../services/rol.service';
import { ProvinciaService } from '../../../../../services/provincia.service';
import { UsuarioService } from '../../../../../services/usuario.service';
import { UsuarioRolService } from '../../../../../services/usuariorol.service';
import { UsuarioProvinciaService } from '../../../../../services/usuarioprovincia.service';
import { Rol } from '../../../../../models/rol';
import { Provincia } from '../../../../../models/provincia';
import { UsuarioModel } from '../../../../../models/usuario-model';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

describe('RolesComponent (usuarios/edit)', () => {
  let component: RolesComponent;
  let fixture: ComponentFixture<RolesComponent>;
  let rolServiceSpy: jasmine.SpyObj<RolService>;
  let provinciaServiceSpy: jasmine.SpyObj<ProvinciaService>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;
  let usuarioRolServiceSpy: jasmine.SpyObj<UsuarioRolService>;
  let usuarioProvinciaServiceSpy: jasmine.SpyObj<UsuarioProvinciaService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const rolesMock: Rol[] = [
    { id: 1, nombre: 'Administrador', activo: true } as Rol,
    { id: 2, nombre: 'Editor', activo: true } as Rol,
    { id: 3, nombre: 'Lector', activo: true } as Rol
  ];

  const provinciasMock: Provincia[] = [
    { id: 1, ine: '11', nombre: 'Cádiz', activo: true },
    { id: 2, ine: '41', nombre: 'Sevilla', activo: true }
  ];

  const usuarioMock: UsuarioModel = {
    id: '1',
    nombreUsuario: 'jperez',
    nombre: 'Juan',
    apellido1: 'Pérez',
    activo: true,
    email: 'juan@x.com',
    roles: [{ id: 2 } as Rol]
  };

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    rolServiceSpy = jasmine.createSpyObj('RolService', ['getAll']);
    provinciaServiceSpy = jasmine.createSpyObj('ProvinciaService', ['getAll']);
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['get']);
    usuarioRolServiceSpy = jasmine.createSpyObj('UsuarioRolService', ['asignarRoles']);
    usuarioProvinciaServiceSpy = jasmine.createSpyObj('UsuarioProvinciaService', ['getByUsuario', 'asignarProvincias']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    usuarioServiceSpy.get.and.returnValue(of(respuesta(usuarioMock)));
    rolServiceSpy.getAll.and.returnValue(of(respuesta(rolesMock)));
    provinciaServiceSpy.getAll.and.returnValue(of(respuesta(provinciasMock)));
    usuarioProvinciaServiceSpy.getByUsuario.and.returnValue(of(respuesta([{ provinciaId: 1 }])));

    await TestBed.configureTestingModule({
      imports: [RolesComponent],
      providers: [
        { provide: RolService, useValue: rolServiceSpy },
        { provide: ProvinciaService, useValue: provinciaServiceSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: UsuarioRolService, useValue: usuarioRolServiceSpy },
        { provide: UsuarioProvinciaService, useValue: usuarioProvinciaServiceSpy },
        { provide: Router, useValue: routerSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RolesComponent);
    component = fixture.componentInstance;
  });

  function inicializar(idUsuario = '1'): void {
    fixture.componentRef.setInput('idUsuario', idUsuario);
    fixture.detectChanges();
  }

  it('se crea correctamente y carga roles del usuario, catálogo de roles y provincias', () => {
    inicializar();

    expect(component).toBeTruthy();
    expect(usuarioServiceSpy.get).toHaveBeenCalledWith('1');
    expect(component.rolesUsuario).toEqual([2]);
    expect(component.roles.length).toBe(3);
    expect(component.provinciasSeleccionadas.map(p => p.id)).toEqual([1]);
    expect(component.provinciasDisponibles.map(p => p.id)).toEqual([2]);
  });

  it('cargarRolesUsuario() no falla si la petición de usuario da error', () => {
    usuarioServiceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    inicializar();

    expect(component.rolesUsuario).toEqual([]);
  });

  it('cargarRoles() notifica error si falla', () => {
    rolServiceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    inicializar();

    expect(component.cargandoRoles).toBeFalse();
    expect(component.roles).toEqual([]);
  });

  it('cargarProvincias() notifica error si falla', () => {
    provinciaServiceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    inicializar();

    expect(component.cargandoProvincias).toBeFalse();
  });

  it('tieneRol() indica si el usuario tiene asignado un rol', () => {
    inicializar();

    expect(component.tieneRol(2)).toBeTrue();
    expect(component.tieneRol(3)).toBeFalse();
  });

  it('toggleRol() añade un rol no asignado', () => {
    inicializar();

    component.toggleRol(3);

    expect(component.rolesUsuario).toContain(3);
  });

  it('toggleRol() quita un rol ya asignado', () => {
    inicializar();

    component.toggleRol(2);

    expect(component.rolesUsuario).not.toContain(2);
  });

  it('toggleRol(1) activa Administrador y sustituye todos los demás roles', () => {
    inicializar();

    component.toggleRol(1);

    expect(component.rolesUsuario).toEqual([1]);
  });

  it('toggleRol(1) desactiva Administrador si ya estaba activo', () => {
    inicializar();
    component.toggleRol(1);

    component.toggleRol(1);

    expect(component.rolesUsuario).toEqual([]);
  });

  it('toggleRol() ignora otros roles mientras Administrador esté activo', () => {
    inicializar();
    component.toggleRol(1);

    component.toggleRol(3);

    expect(component.rolesUsuario).toEqual([1]);
  });

  it('moverAseleccionadas() traslada las provincias elegidas a seleccionadas', () => {
    inicializar();
    component.provinciasDisponiblesElegidas = [provinciasMock[1]];

    component.moverAseleccionadas();

    expect(component.provinciasSeleccionadas.map(p => p.id)).toContain(2);
    expect(component.provinciasDisponibles.length).toBe(0);
    expect(component.provinciasDisponiblesElegidas).toEqual([]);
  });

  it('moverTodasASeleccionadas() traslada todas las disponibles a seleccionadas', () => {
    inicializar();

    component.moverTodasASeleccionadas();

    expect(component.provinciasDisponibles).toEqual([]);
    expect(component.provinciasSeleccionadas.length).toBe(2);
  });

  it('moverADisponibles() traslada las seleccionadas elegidas a disponibles', () => {
    inicializar();
    component.provinciasSeleccionadasElegidas = [provinciasMock[0]];

    component.moverADisponibles();

    expect(component.provinciasDisponibles.map(p => p.id)).toContain(1);
    expect(component.provinciasSeleccionadas.length).toBe(0);
  });

  it('moverTodasADisponibles() traslada todas las seleccionadas a disponibles', () => {
    inicializar();

    component.moverTodasADisponibles();

    expect(component.provinciasSeleccionadas).toEqual([]);
    expect(component.provinciasDisponibles.length).toBe(2);
  });

  it('guardar() no hace nada si no hay provincias seleccionadas', () => {
    inicializar();
    component.provinciasSeleccionadas = [];

    component.guardar();

    expect(usuarioRolServiceSpy.asignarRoles).not.toHaveBeenCalled();
  });

  it('guardar() asigna roles y provincias correctamente', () => {
    inicializar();
    usuarioRolServiceSpy.asignarRoles.and.returnValue(of(respuesta(true)));
    usuarioProvinciaServiceSpy.asignarProvincias.and.returnValue(of(respuesta(true)));

    component.guardar();

    expect(usuarioRolServiceSpy.asignarRoles).toHaveBeenCalledWith(1, [2]);
    expect(usuarioProvinciaServiceSpy.asignarProvincias).toHaveBeenCalledWith(1, [1]);
    expect(component.guardando).toBeFalse();
  });

  it('guardar() notifica error si falla', () => {
    inicializar();
    usuarioRolServiceSpy.asignarRoles.and.returnValue(throwError(() => new Error('fallo')));
    usuarioProvinciaServiceSpy.asignarProvincias.and.returnValue(of(respuesta(true)));

    component.guardar();

    expect(component.guardando).toBeFalse();
  });

  it('cancelar() navega a /usuarios', () => {
    inicializar();

    component.cancelar();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/usuarios']);
  });
});
