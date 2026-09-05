import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PerfilComponent } from './perfil.component';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioModel } from '../../../models/usuario-model';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let serviceSpy: jasmine.SpyObj<UsuarioService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const usuarioMock: UsuarioModel = {
    id: '1',
    nombreUsuario: 'jperez',
    nombre: 'Juan',
    apellido1: 'Pérez',
    apellido2: 'García',
    email: 'juan@x.com',
    activo: true,
    avatar: null,
    roles: []
  } as any;

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('UsuarioService', ['get', 'updatePerfil']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        { provide: UsuarioService, useValue: serviceSpy },
        { provide: Router, useValue: routerSpy },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el perfil del usuario 1 (hardcodeado)', () => {
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.form.get('nombre')?.value).toBe('Juan');
    expect(component.cargando).toBeFalse();
  });

  it('notifica error si falla la carga del perfil', () => {
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
  });

  it('avatarUrl devuelve la imagen por defecto si no hay avatar', () => {
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));
    fixture.detectChanges();

    expect(component.avatarUrl).toBe('/images/no_image_user.png');
  });

  it('avatarUrl devuelve la URL tal cual si empieza por http', () => {
    serviceSpy.get.and.returnValue(of(respuesta({ ...usuarioMock, avatar: 'http://x.com/foto.png' })));
    fixture.detectChanges();

    expect(component.avatarUrl).toBe('http://x.com/foto.png');
  });

  it('avatarUrl construye la URL del backend si el avatar es un nombre de archivo', () => {
    serviceSpy.get.and.returnValue(of(respuesta({ ...usuarioMock, avatar: 'foto.png' })));
    fixture.detectChanges();

    expect(component.avatarUrl).toContain('/usuarios/uploads/foto.png');
  });

  it('guardar() no hace nada si el formulario es inválido', () => {
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));
    fixture.detectChanges();
    component.form.patchValue({ email: 'no-es-email' });

    component.guardar();

    expect(serviceSpy.updatePerfil).not.toHaveBeenCalled();
  });

  it('guardar() llama a updatePerfil() cuando el formulario es válido', () => {
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));
    fixture.detectChanges();
    serviceSpy.updatePerfil.and.returnValue(of(respuesta(true)));

    component.guardar();

    expect(serviceSpy.updatePerfil).toHaveBeenCalledWith(1, jasmine.objectContaining({ nombre: 'Juan' }));
    expect(component.guardando).toBeFalse();
  });

  it('guardar() notifica error si falla', () => {
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));
    fixture.detectChanges();
    serviceSpy.updatePerfil.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar();

    expect(component.guardando).toBeFalse();
  });

  it('cancelar() navega a /instalaciones', () => {
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));
    fixture.detectChanges();

    component.cancelar();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instalaciones']);
  });

  it('onFileSelected() lee el archivo y guarda el avatar en Base64', async () => {
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));
    fixture.detectChanges();

    const file = new File(['contenido'], 'avatar.png', { type: 'image/png' });
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });

    component.onFileSelected({ target: input } as unknown as Event);

    await new Promise<void>(resolve => {
      const comprobar = () => {
        if (component.form.get('avatar')?.value) {
          resolve();
        } else {
          setTimeout(comprobar, 10);
        }
      };
      comprobar();
    });

    expect(component.form.get('avatar')?.value).toContain('data:');
  });

  it('onFileSelected() no lanza error si no hay archivo seleccionado', () => {
    serviceSpy.get.and.returnValue(of(respuesta(usuarioMock)));
    fixture.detectChanges();

    const input = document.createElement('input');
    input.type = 'file';

    expect(() => component.onFileSelected({ target: input } as unknown as Event)).not.toThrow();
  });
});
