import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ComplementarioComponent } from './complementario.component';
import { InstalacionEspacioComplementarioService } from '../../../../../services/instalacionEspacioComplementario.service';
import { DialogService } from '../../../../../services/dialog.service';
import { InstalacionEspacioComplementario } from '../../../../../models/instalacionEspacioComplementario';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

describe('ComplementarioComponent', () => {
  let component: ComplementarioComponent;
  let fixture: ComponentFixture<ComplementarioComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionEspacioComplementarioService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearEspaciosMock = (): InstalacionEspacioComplementario[] => [
    { id: 1, idInstalacion: 10, espacioComplementario: { id: 1, nombre: 'Vestuarios' } as any, visible: true },
    { id: 2, idInstalacion: 10, espacioComplementario: { id: 2, nombre: 'Cafetería' } as any, visible: false }
  ];
  let espaciosMock: InstalacionEspacioComplementario[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    espaciosMock = crearEspaciosMock();
    serviceSpy = jasmine.createSpyObj('InstalacionEspacioComplementarioService', [
      'getAll', 'get', 'cambiarVisible', 'borrarRegistro', 'crear', 'update'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(espaciosMock)));

    await TestBed.configureTestingModule({
      imports: [ComplementarioComponent],
      providers: [
        { provide: InstalacionEspacioComplementarioService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComplementarioComponent);
    component = fixture.componentInstance;
  });

  function inicializarConInstalacion(id = '10'): void {
    fixture.componentRef.setInput('idInstalacion', id);
    fixture.detectChanges();
  }

  it('se crea correctamente y carga los espacios si hay idInstalacion', () => {
    inicializarConInstalacion('10');

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith({ idInstalacion: '10' });
    expect(component.espaciosComplementarios.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('no carga nada si no hay idInstalacion', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).not.toHaveBeenCalled();
  });

  it('emite cargandoChange(true) y luego cargandoChange(false) al cargar', () => {
    const emitidos: boolean[] = [];
    component.cargandoChange.subscribe(v => emitidos.push(v));

    inicializarConInstalacion('10');

    expect(emitidos).toEqual([true, false]);
  });

  it('cargarDatos() notifica error si falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    inicializarConInstalacion('10');

    expect(component.cargando).toBeFalse();
  });

  it('limpiar() resetea el formulario, conserva el id de instalación y vuelve a buscar', () => {
    inicializarConInstalacion('10');
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.get('id')?.value).toBe('10');
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    inicializarConInstalacion('10');
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.espaciosComplementarios).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.espaciosComplementarios).toEqual([]);
  });

  it('addRegistro() crea el espacio complementario y recarga el listado', () => {
    inicializarConInstalacion('10');
    serviceSpy.crear.and.returnValue(of(respuesta(true)));
    serviceSpy.getAll.calls.reset();

    component.addRegistro(5);

    expect(serviceSpy.crear).toHaveBeenCalledWith(jasmine.objectContaining({
      idInstalacion: 10,
      espacioComplementario: { id: 5 }
    }));
    expect(component.guardando).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('addRegistro() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.crear.and.returnValue(throwError(() => new Error('fallo')));

    component.addRegistro(5);

    expect(component.guardando).toBeFalse();
  });

  it('cambiarVisible() invierte la visibilidad del espacio afectado', () => {
    inicializarConInstalacion('10');
    serviceSpy.cambiarVisible.and.returnValue(of(respuesta(true)));

    component.cambiarVisible(1);

    expect(serviceSpy.cambiarVisible).toHaveBeenCalledWith(1);
    expect(component.espaciosComplementarios.find(e => e.id === 1)?.visible).toBeFalse();
  });

  it('cambiarVisible() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.cambiarVisible.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarVisible(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre del espacio complementario', () => {
    inicializarConInstalacion('10');
    const espacio = component.espaciosComplementarios.find(e => e.id === 1)!;

    component.confirmarBorrado(espacio);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Vestuarios');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    inicializarConInstalacion('10');
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const espacio = component.espaciosComplementarios.find(e => e.id === 1)!;

    component.confirmarBorrado(espacio);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.espaciosComplementarios.find(e => e.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const espacio = component.espaciosComplementarios.find(e => e.id === 1)!;

    component.confirmarBorrado(espacio);

    expect(component).toBeTruthy();
  });

  it('abrirModal() limpia el espacio seleccionado y abre el modal', () => {
    inicializarConInstalacion('10');
    component.espacioComplementario = espaciosMock[0];

    component.abrirModal();

    expect(component.espacioComplementario).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga el espacio y abre el modal', () => {
    inicializarConInstalacion('10');
    serviceSpy.get.and.returnValue(of(respuesta(espaciosMock[0])));

    component.editar(1);

    expect(serviceSpy.get).toHaveBeenCalledWith(1);
    expect(component.espacioComplementario).toEqual(espaciosMock[0]);
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() no abre el modal si la respuesta no trae datos', () => {
    inicializarConInstalacion('10');
    serviceSpy.get.and.returnValue(of(respuesta(null)));

    component.editar(1);

    expect(component.modalVisible).toBeFalse();
  });

  it('editar() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    component.editar(1);

    expect(component).toBeTruthy();
  });

  it('guardar() no hace nada si no viene espacioComplementario', () => {
    inicializarConInstalacion('10');

    component.guardar({ id: null, visible: true });

    expect(serviceSpy.crear).not.toHaveBeenCalled();
    expect(serviceSpy.update).not.toHaveBeenCalled();
  });

  it('guardar() sin id llama a crear() y recarga el listado', () => {
    inicializarConInstalacion('10');
    serviceSpy.crear.and.returnValue(of(respuesta(true)));
    serviceSpy.getAll.calls.reset();

    component.guardar({ id: null, espacioComplementario: 5, visible: true });

    expect(serviceSpy.crear).toHaveBeenCalledWith(jasmine.objectContaining({ espacioComplementario: { id: 5 } }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a update() y recarga el listado', () => {
    inicializarConInstalacion('10');
    serviceSpy.update.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, espacioComplementario: 5, visible: true });

    expect(serviceSpy.update).toHaveBeenCalledWith(1, jasmine.objectContaining({ id: 1, espacioComplementario: { id: 5 } }));
  });

  it('guardar() notifica error si crear() falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.crear.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: null, espacioComplementario: 5, visible: true });

    expect(component.guardando).toBeFalse();
  });

  it('guardar() notifica error si update() falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.update.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, espacioComplementario: 5, visible: true });

    expect(component.guardando).toBeFalse();
  });
});
