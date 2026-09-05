import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DatosComponent } from './datos.component';
import { UsuarioService } from '../../../../../services/usuario.service';
import { UsuarioModel } from '../../../../../models/usuario-model';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

describe('DatosComponent (usuarios/edit)', () => {
  let component: DatosComponent;
  let fixture: ComponentFixture<DatosComponent>;
  let serviceSpy: jasmine.SpyObj<UsuarioService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const usuarioMock: UsuarioModel = {
    id: 'u1',
    nombreUsuario: 'jperez',
    nombre: 'Juan',
    apellido1: 'Pérez',
    apellido2: 'García',
    email: 'juan@x.com',
    activo: true,
    roles: []
  };

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('UsuarioService', ['get', 'add', 'update']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DatosComponent],
      providers: [
        { provide: UsuarioService, useValue: serviceSpy },
        { provide: Router, useValue: routerSpy },
        MessageService,
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatosComponent);
    component = fixture.componentInstance;
  });

  it('modo alta: no carga nada y exige password', () => {
    fixture.detectChanges();

    expect(component.esEdicion).toBeFalse();
    expect(serviceSpy.get).not.toHaveBeenCalled();
    expect(component.form.get('password')?.hasValidator).toBeTruthy();
    expect(component.cargando).toBeFalse();
  });

  it('modo edición: carga el usuario y rellena el formulario', () => {
    fixture.componentRef.setInput('idUsuario', 'u1');
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));

    fixture.detectChanges();

    expect(component.esEdicion).toBeTrue();
    expect(serviceSpy.get).toHaveBeenCalledWith('u1');
    expect(component.form.get('nombre')?.value).toBe('Juan');
    expect(component.cargando).toBeFalse();
  });

  it('modo edición: notifica error si falla la carga', () => {
    fixture.componentRef.setInput('idUsuario', 'u1');
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
  });

  it('guardar() no hace nada si el formulario es inválido', () => {
    fixture.detectChanges();

    component.guardar();

    expect(serviceSpy.add).not.toHaveBeenCalled();
  });

  it('guardar() en alta llama a add() y navega a /usuarios', () => {
    fixture.detectChanges();
    component.form.patchValue({
      nombreUsuario: 'nuevo',
      password: '12345',
      nombre: 'Nuevo',
      apellido1: 'Usuario',
      email: 'nuevo@x.com'
    });
    serviceSpy.add.and.returnValue(of(respuesta(true)));

    component.guardar();

    expect(serviceSpy.add).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/usuarios']);
    expect(component.guardando).toBeFalse();
  });

  it('guardar() en alta notifica error si falla', () => {
    fixture.detectChanges();
    component.form.patchValue({
      nombreUsuario: 'nuevo',
      password: '12345',
      nombre: 'Nuevo',
      apellido1: 'Usuario',
      email: 'nuevo@x.com'
    });
    serviceSpy.add.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar();

    expect(component.guardando).toBeFalse();
  });

  it('guardar() en edición llama a update() sin enviar password', () => {
    fixture.componentRef.setInput('idUsuario', 'u1');
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));
    fixture.detectChanges();
    serviceSpy.update.and.returnValue(of(respuesta(true)));

    component.guardar();

    expect(serviceSpy.update).toHaveBeenCalled();
    const datosEnviados = serviceSpy.update.calls.mostRecent().args[1];
    expect(datosEnviados.password).toBeUndefined();
    expect(component.guardando).toBeFalse();
  });

  it('guardar() en edición notifica error si falla', () => {
    fixture.componentRef.setInput('idUsuario', 'u1');
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));
    fixture.detectChanges();
    serviceSpy.update.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar();

    expect(component.guardando).toBeFalse();
  });

  it('cancelar() navega a /usuarios', () => {
    fixture.detectChanges();

    component.cancelar();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/usuarios']);
  });
});
