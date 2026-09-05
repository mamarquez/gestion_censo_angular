import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { provideTranslateService } from '@ngx-translate/core';
import { ImagenComponent } from './imagen.component';
import { ImagenService } from '../../../../../services/imagen.service';
import { DialogService } from '../../../../../services/dialog.service';
import { Imagen } from '../../../../../models/imagen';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

describe('ImagenComponent', () => {
  let component: ImagenComponent;
  let fixture: ComponentFixture<ImagenComponent>;
  let serviceSpy: jasmine.SpyObj<ImagenService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearImagenesMock = (): Imagen[] => [
    { id: 1, idInstalacion: 10, nombre: 'foto1.png', descripcion: 'desc', visible: true },
    { id: 2, idInstalacion: 10, nombre: 'foto2.png', descripcion: 'otro', visible: false }
  ];
  let imagenesMock: Imagen[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    imagenesMock = crearImagenesMock();
    serviceSpy = jasmine.createSpyObj('ImagenService', [
      'getAll', 'cambiarEstado', 'borrarRegistro', 'descargar', 'addRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(imagenesMock)));

    await TestBed.configureTestingModule({
      imports: [ImagenComponent],
      providers: [
        { provide: ImagenService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService,
        provideNoopAnimations(),
        provideTranslateService({ lang: 'es', fallbackLang: 'es' })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImagenComponent);
    component = fixture.componentInstance;
  });

  function inicializarConInstalacion(id = '10'): void {
    fixture.componentRef.setInput('idInstalacion', id);
    fixture.detectChanges();
  }

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga las imágenes de la instalación al recibir idInstalacion', () => {
    inicializarConInstalacion('10');

    expect(serviceSpy.getAll).toHaveBeenCalledWith('10');
    expect(component.imagenes?.length).toBe(2);
    expect((component.imagenes?.[0] as any).imagenUrl).toContain('foto1.png');
    expect(component.cargando).toBeFalse();
  });

  it('notifica error si falla la carga', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    inicializarConInstalacion('10');

    expect(component.cargando).toBeFalse();
  });

  it('cambiarEstado() invierte la visibilidad de la imagen afectada', () => {
    inicializarConInstalacion('10');
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.imagenes?.find(i => i.id === 1)?.visible).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre de la imagen', () => {
    inicializarConInstalacion('10');

    component.confirmarBorrado(imagenesMock[0]);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('foto1.png');
  });

  it('confirmarBorrado() -> onAccept borra el registro y recarga el listado', () => {
    inicializarConInstalacion('10');
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    serviceSpy.getAll.calls.reset();

    component.confirmarBorrado(imagenesMock[0]);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(serviceSpy.getAll).toHaveBeenCalledWith('10');
  });

  it('borrarRegistro() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());

    component.confirmarBorrado(imagenesMock[0]);

    expect(component).toBeTruthy();
  });

  it('descargar() crea y limpia un enlace temporal para descargar el blob', () => {
    inicializarConInstalacion('10');
    const blob = new Blob(['contenido']);
    serviceSpy.descargar.and.returnValue(of(blob));
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
    spyOn(window.URL, 'revokeObjectURL');

    component.descargar('foto1.png');

    expect(serviceSpy.descargar).toHaveBeenCalledWith('foto1.png');
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('descargar() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.descargar.and.returnValue(throwError(() => new Error('fallo')));

    component.descargar('foto1.png');

    expect(component).toBeTruthy();
  });

  it('onFileSelected() rechaza formatos no permitidos', () => {
    inicializarConInstalacion('10');
    const file = new File(['contenido'], 'documento.pdf', { type: 'application/pdf' });
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });

    component.onFileSelected({ target: input } as unknown as Event);

    expect(component.imagenForm.get('contenido')?.value).toBeFalsy();
  });

  it('onFileSelected() lee una imagen válida y rellena nombre y contenido en Base64', async () => {
    inicializarConInstalacion('10');

    const file = new File(['contenido'], 'foto.png', { type: 'image/png' });
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });

    component.onFileSelected({ target: input } as unknown as Event);

    await new Promise<void>(resolve => {
      const comprobar = () => {
        if (component.imagenForm.get('contenido')?.value) {
          resolve();
        } else {
          setTimeout(comprobar, 10);
        }
      };
      comprobar();
    });

    expect(component.imagenForm.get('nombre')?.value).toBe('foto.png');
    expect(component.imagenForm.get('contenido')?.value).toContain('data:');
  });

  it('cancelarImagen() resetea el formulario', () => {
    inicializarConInstalacion('10');
    component.imagenForm.patchValue({ nombre: 'x', contenido: 'data:...' });

    component.cancelarImagen();

    expect(component.imagenForm.get('nombre')?.value).toBeFalsy();
    expect(component.imagenForm.get('contenido')?.value).toBeFalsy();
  });

  it('guardarImagen() no llama al servicio si el formulario es inválido', () => {
    inicializarConInstalacion('10');
    component.imagenForm.patchValue({ nombre: '', contenido: null });

    component.guardarImagen();

    expect(serviceSpy.addRegistro).not.toHaveBeenCalled();
  });

  it('guardarImagen() llama a addRegistro y recarga el listado si el formulario es válido', () => {
    inicializarConInstalacion('10');
    component.imagenForm.patchValue({
      nombre: 'foto.png',
      contenido: 'data:image/png;base64,AAAA'
    });
    serviceSpy.addRegistro.and.returnValue(of(respuesta(true)));
    serviceSpy.getAll.calls.reset();

    component.guardarImagen();

    expect(serviceSpy.addRegistro).toHaveBeenCalled();
    const datosEnviados = serviceSpy.addRegistro.calls.mostRecent().args[0];
    expect(datosEnviados.idInstalacion).toBe(10);
    expect(datosEnviados.nombre).toBe('foto.png');
    expect(component.guardando).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalledWith('10');
  });

  it('guardarImagen() notifica error si falla', () => {
    inicializarConInstalacion('10');
    component.imagenForm.patchValue({
      nombre: 'foto.png',
      contenido: 'data:image/png;base64,AAAA'
    });
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardarImagen();

    expect(component.guardando).toBeFalse();
  });

  it('tooltipVisibilidad() devuelve el texto correcto según la visibilidad', () => {
    expect(component.tooltipVisibilidad(true)).toBe('Ocultar');
    expect(component.tooltipVisibilidad(false)).toBe('Mostrar');
    expect(component.tooltipVisibilidad(undefined)).toBe('Mostrar');
  });

  it('ampliar() y cerrarAmpliada() controlan la imagen ampliada', () => {
    inicializarConInstalacion('10');

    component.ampliar(imagenesMock[0]);
    expect(component.imagenAmpliada).toEqual(imagenesMock[0]);

    component.cerrarAmpliada();
    expect(component.imagenAmpliada).toBeNull();
  });
});
