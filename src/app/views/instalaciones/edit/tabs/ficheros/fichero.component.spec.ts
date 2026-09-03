import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { provideTranslateService } from '@ngx-translate/core';
import { FicheroComponent } from './fichero.component';
import { FicheroService } from '../../../../../services/fichero.service';
import { DialogService } from '../../../../../services/dialog.service';
import { Fichero } from '../../../../../models/fichero';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

describe('FicheroComponent', () => {
  let component: FicheroComponent;
  let fixture: ComponentFixture<FicheroComponent>;
  let ficheroServiceSpy: jasmine.SpyObj<FicheroService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const ficherosMock: Fichero[] = [
    { id: 1, idInstalacion: 10, nombre: 'informe.pdf', descripcion: 'desc', visible: true },
    { id: 2, idInstalacion: 10, nombre: 'plano.dwg', descripcion: 'otro', visible: false }
  ];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    ficheroServiceSpy = jasmine.createSpyObj('FicheroService', [
      'getAll', 'cambiarEstado', 'borrarRegistro', 'descargar', 'addRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    ficheroServiceSpy.getAll.and.returnValue(of(respuesta(ficherosMock)));

    await TestBed.configureTestingModule({
      imports: [FicheroComponent],
      providers: [
        { provide: FicheroService, useValue: ficheroServiceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService,
        provideTranslateService({ lang: 'es', fallbackLang: 'es' })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FicheroComponent);
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

  it('carga los ficheros de la instalación al recibir idInstalacion', () => {
    inicializarConInstalacion('10');

    expect(ficheroServiceSpy.getAll).toHaveBeenCalledWith('10');
    expect(component.ficheros?.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('marca cargando=false y notifica error si falla la carga', () => {
    ficheroServiceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    inicializarConInstalacion('10');

    expect(component.cargando).toBeFalse();
    expect(component.ficheros).toBeNull();
  });

  it('cambiarEstado() invierte la visibilidad del fichero afectado', () => {
    inicializarConInstalacion('10');
    ficheroServiceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(ficheroServiceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.ficheros?.find(f => f.id === 1)?.visible).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre del fichero', () => {
    inicializarConInstalacion('10');

    component.confirmarBorrado(ficherosMock[0]);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('informe.pdf');
    expect(config.mensaje).not.toContain('espacio deportivo');
  });

  it('confirmarBorrado() -> onAccept borra el registro y recarga el listado', () => {
    inicializarConInstalacion('10');
    ficheroServiceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());

    ficheroServiceSpy.getAll.calls.reset();
    component.confirmarBorrado(ficherosMock[0]);

    expect(ficheroServiceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(ficheroServiceSpy.getAll).toHaveBeenCalledWith('10');
  });

  it('onFileSelected() lee el fichero y rellena nombre y contenido en Base64', async () => {
    inicializarConInstalacion('10');

    const contenido = 'contenido de prueba';
    const file = new File([contenido], 'documento.pdf', { type: 'application/pdf' });
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });

    component.onFileSelected({ target: input } as unknown as Event);

    // FileReader.readAsDataURL() es asíncrono vía eventos (no vía microtask/promesa),
    // así que se espera activamente a que el FormGroup se actualice.
    await new Promise<void>(resolve => {
      const comprobar = () => {
        if (component.ficheroForm.get('contenido')?.value) {
          resolve();
        } else {
          setTimeout(comprobar, 10);
        }
      };
      comprobar();
    });

    expect(component.ficheroForm.get('nombre')?.value).toBe('documento.pdf');
    expect(component.ficheroForm.get('contenido')?.value).toContain('data:');
  });

  it('cancelarFichero() resetea el formulario', () => {
    inicializarConInstalacion('10');
    component.ficheroForm.patchValue({ nombre: 'x', contenido: 'data:...' });

    component.cancelarFichero();

    expect(component.ficheroForm.get('nombre')?.value).toBeFalsy();
    expect(component.ficheroForm.get('contenido')?.value).toBeFalsy();
  });

  it('guardarFichero() no llama al servicio si el formulario es inválido', () => {
    inicializarConInstalacion('10');
    component.ficheroForm.patchValue({ nombre: '', contenido: null });

    component.guardarFichero();

    expect(ficheroServiceSpy.addRegistro).not.toHaveBeenCalled();
  });

  it('guardarFichero() llama a addRegistro y recarga el listado si el formulario es válido', () => {
    inicializarConInstalacion('10');
    component.ficheroForm.patchValue({
      nombre: 'documento.pdf',
      contenido: 'data:application/pdf;base64,AAAA'
    });
    ficheroServiceSpy.addRegistro.and.returnValue(of(respuesta(true)));
    ficheroServiceSpy.getAll.calls.reset();

    component.guardarFichero();

    expect(ficheroServiceSpy.addRegistro).toHaveBeenCalled();
    const datosEnviados = ficheroServiceSpy.addRegistro.calls.mostRecent().args[0];
    expect(datosEnviados.idInstalacion).toBe(10);
    expect(datosEnviados.nombre).toBe('documento.pdf');
    expect(component.guardando).toBeFalse();
    expect(ficheroServiceSpy.getAll).toHaveBeenCalledWith('10');
  });

  it('tooltipVisibilidad() devuelve el texto correcto según la visibilidad', () => {
    expect(component.tooltipVisibilidad(true)).toBe('Ocultar');
    expect(component.tooltipVisibilidad(false)).toBe('Mostrar');
    expect(component.tooltipVisibilidad(undefined)).toBe('Mostrar');
  });

  it('truncar() trunca textos largos en la plantilla', () => {
    const largo = 'x'.repeat(200);
    expect(component.truncar(largo).endsWith('…')).toBeTrue();
    expect(component.truncar('corto')).toBe('corto');
  });
});
