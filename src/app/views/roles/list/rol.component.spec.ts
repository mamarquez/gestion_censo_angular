import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { RolComponent } from './rol.component';
import { RolService } from '../../../services/rol.service';
import { RolPermisoService } from '../../../services/rol-permiso.service';
import { DialogService } from '../../../services/dialog.service';
import { Rol } from '../../../models/rol';
import { RolPermisoModel } from '../../../models/rol-permiso-model';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('RolComponent', () => {
  let component: RolComponent;
  let fixture: ComponentFixture<RolComponent>;
  let serviceSpy: jasmine.SpyObj<RolService>;
  let rolPermisoServiceSpy: jasmine.SpyObj<RolPermisoService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const crearRolesMock = (): Rol[] => [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso total', activo: true },
    { id: 2, nombre: 'Lector', descripcion: 'Solo lectura', activo: false }
  ];
  let rolesMock: Rol[];

  const crearPermisosMock = (): RolPermisoModel[] => [
    { id: 10, idRol: 1, idTipoRol: 100, nombreTipoRol: 'Ver instalaciones' }
  ];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    rolesMock = crearRolesMock();
    serviceSpy = jasmine.createSpyObj('RolService', [
      'getAll', 'cambiarEstado', 'borrarRegistro'
    ]);
    rolPermisoServiceSpy = jasmine.createSpyObj('RolPermisoService', [
      'getAll', 'crear', 'cambiarEstado', 'borrarRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    serviceSpy.getAll.and.returnValue(of(respuesta(rolesMock)));

    await TestBed.configureTestingModule({
      imports: [RolComponent],
      providers: [
        { provide: RolService, useValue: serviceSpy },
        { provide: RolPermisoService, useValue: rolPermisoServiceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: Router, useValue: routerSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RolComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.roles.length).toBe(2);
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
    component.form.patchValue({ nombre: 'Admin' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Admin' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.roles).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.roles).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Admin' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo del rol afectado', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.roles.find(r => r.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre del rol', () => {
    fixture.detectChanges();
    const rol = component.roles.find(r => r.id === 1)!;

    component.confirmarBorrado(rol);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Administrador');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const rol = component.roles.find(r => r.id === 1)!;

    component.confirmarBorrado(rol);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.roles.find(r => r.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const rol = component.roles.find(r => r.id === 1)!;

    component.confirmarBorrado(rol);

    expect(component.cargando).toBeFalse();
  });

  it('toggleFila() expande la fila y carga los permisos la primera vez', () => {
    fixture.detectChanges();
    rolPermisoServiceSpy.getAll.and.returnValue(of(respuesta(crearPermisosMock())));
    const rol = component.roles.find(r => r.id === 1)!;

    component.toggleFila(rol);

    expect(component.filasExpandidas[1]).toBeTrue();
    expect(rolPermisoServiceSpy.getAll).toHaveBeenCalledWith({ idRol: 1 });
    expect(component.permisosPorRol[1].length).toBe(1);
    expect(component.cargandoPermisos[1]).toBeFalse();
  });

  it('toggleFila() colapsa la fila si ya estaba expandida sin recargar permisos', () => {
    fixture.detectChanges();
    rolPermisoServiceSpy.getAll.and.returnValue(of(respuesta(crearPermisosMock())));
    const rol = component.roles.find(r => r.id === 1)!;

    component.toggleFila(rol);
    rolPermisoServiceSpy.getAll.calls.reset();
    component.toggleFila(rol);

    expect(component.filasExpandidas[1]).toBeFalse();
    expect(rolPermisoServiceSpy.getAll).not.toHaveBeenCalled();
  });

  it('cargarPermisos() (vía toggleFila) notifica error y deja el listado vacío si falla', () => {
    fixture.detectChanges();
    rolPermisoServiceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    const rol = component.roles.find(r => r.id === 1)!;

    component.toggleFila(rol);

    expect(component.permisosPorRol[1]).toEqual([]);
    expect(component.cargandoPermisos[1]).toBeFalse();
  });

  it('abrirModalPermiso() selecciona el rol y abre el modal', () => {
    fixture.detectChanges();
    const rol = component.roles.find(r => r.id === 1)!;

    component.abrirModalPermiso(rol);

    expect(component.rolSeleccionado).toBe(rol);
    expect(component.modalVisible).toBeTrue();
  });

  it('nuevoRol() navega a /roles/nuevo', () => {
    fixture.detectChanges();

    component.nuevoRol();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/roles/nuevo']);
  });

  it('editar() navega a /roles/{id}', () => {
    fixture.detectChanges();

    component.editar(1);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/roles', 1]);
  });

  it('idsTipoRolAsignados() devuelve los idTipoRol de los permisos cargados', () => {
    fixture.detectChanges();
    rolPermisoServiceSpy.getAll.and.returnValue(of(respuesta(crearPermisosMock())));
    component.toggleFila(component.roles.find(r => r.id === 1)!);

    expect(component.idsTipoRolAsignados(1)).toEqual([100]);
  });

  it('idsTipoRolAsignados() devuelve un array vacío si no hay permisos cargados', () => {
    fixture.detectChanges();

    expect(component.idsTipoRolAsignados(99)).toEqual([]);
  });

  it('permisoGuardado() recarga los permisos del rol', () => {
    fixture.detectChanges();
    rolPermisoServiceSpy.getAll.and.returnValue(of(respuesta(crearPermisosMock())));

    component.permisoGuardado(1);

    expect(rolPermisoServiceSpy.getAll).toHaveBeenCalledWith({ idRol: 1 });
  });

  it('confirmarBorradoPermiso() delega en DialogService cuando idRol no es 1', () => {
    fixture.detectChanges();
    const permiso = crearPermisosMock()[0];

    component.confirmarBorradoPermiso(2, permiso);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
  });

  it('confirmarBorradoPermiso() no hace nada cuando idRol es 1', () => {
    fixture.detectChanges();
    const permiso = crearPermisosMock()[0];

    component.confirmarBorradoPermiso(1, permiso);

    expect(dialogServiceSpy.confirmar).not.toHaveBeenCalled();
  });

  it('confirmarBorradoPermiso() -> onAccept borra el permiso del rol', () => {
    fixture.detectChanges();
    const permisosDelRol2: RolPermisoModel[] = [{ id: 10, idRol: 2, idTipoRol: 100, nombreTipoRol: 'Ver instalaciones' }];
    rolPermisoServiceSpy.getAll.and.returnValue(of(respuesta(permisosDelRol2)));
    component.toggleFila(component.roles.find(r => r.id === 2)!);
    rolPermisoServiceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());

    component.confirmarBorradoPermiso(2, permisosDelRol2[0]);

    expect(rolPermisoServiceSpy.borrarRegistro).toHaveBeenCalledWith(10);
    expect(component.permisosPorRol[2].find(p => p.id === 10)).toBeUndefined();
  });

  it('borrarPermiso() notifica error si falla', () => {
    fixture.detectChanges();
    rolPermisoServiceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());

    component.confirmarBorradoPermiso(2, crearPermisosMock()[0]);

    expect(rolPermisoServiceSpy.borrarRegistro).toHaveBeenCalled();
  });
});
