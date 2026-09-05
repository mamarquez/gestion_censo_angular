import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DatosTelefonosComponent } from './telefonos.component';
import { InstalacionTelefonoService } from '../../../../../services/instalaciontelefono.service';
import { DialogService } from '../../../../../services/dialog.service';
import { InstalacionTelefono } from '../../../../../models/instalaciontelefono';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

describe('DatosTelefonosComponent', () => {
  let component: DatosTelefonosComponent;
  let fixture: ComponentFixture<DatosTelefonosComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionTelefonoService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearTelefonosMock = (): InstalacionTelefono[] => [
    { id: 1, idInstalacion: 10, numero: '900123456', contacto: 'Recepción', visible: true },
    { id: 2, idInstalacion: 10, numero: '900654321', contacto: 'Administración', visible: false }
  ];
  let telefonosMock: InstalacionTelefono[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    telefonosMock = crearTelefonosMock();
    serviceSpy = jasmine.createSpyObj('InstalacionTelefonoService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(telefonosMock)));

    await TestBed.configureTestingModule({
      imports: [DatosTelefonosComponent],
      providers: [
        { provide: InstalacionTelefonoService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService,
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatosTelefonosComponent);
    component = fixture.componentInstance;
  });

  function inicializarConInstalacion(id = '10'): void {
    fixture.componentRef.setInput('idInstalacion', id);
    fixture.detectChanges();
  }

  it('se crea correctamente y carga los teléfonos si hay idInstalacion', () => {
    inicializarConInstalacion('10');

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith({ idInstalacion: '10' });
    expect(component.telefonos.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('no carga nada si no hay idInstalacion', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).not.toHaveBeenCalled();
  });

  it('cargar() notifica error si falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    inicializarConInstalacion('10');

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia el teléfono seleccionado y abre el modal', () => {
    inicializarConInstalacion('10');
    component.telefono = telefonosMock[0];

    component.abrirModal();

    expect(component.telefono).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('cambiarEstado() invierte la visibilidad del teléfono afectado', () => {
    inicializarConInstalacion('10');
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.telefonos.find(t => t.id === 1)?.visible).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el número del teléfono', () => {
    inicializarConInstalacion('10');
    const telefono = component.telefonos.find(t => t.id === 1)!;

    component.confirmarBorrado(telefono);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('900123456');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    inicializarConInstalacion('10');
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const telefono = component.telefonos.find(t => t.id === 1)!;

    component.confirmarBorrado(telefono);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.telefonos.find(t => t.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const telefono = component.telefonos.find(t => t.id === 1)!;

    component.confirmarBorrado(telefono);

    expect(component).toBeTruthy();
  });

  it('editar() carga el teléfono y abre el modal', () => {
    inicializarConInstalacion('10');
    serviceSpy.get.and.returnValue(of(respuesta(telefonosMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.telefono).toEqual(telefonosMock[0]);
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() notifica error si falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    component.editar('1');

    expect(component.cargando).toBeFalse();
  });

  it('guardar() sin id llama a addRegistro() y recarga el listado', () => {
    inicializarConInstalacion('10');
    serviceSpy.addRegistro.and.returnValue(of(respuesta(true)));
    serviceSpy.getAll.calls.reset();

    component.guardar({ idInstalacion: 10, numero: '900000000', contacto: 'Test', visible: true } as InstalacionTelefono);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ numero: '900000000' }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    inicializarConInstalacion('10');
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, idInstalacion: 10, numero: '900111111', visible: true } as InstalacionTelefono);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, numero: '900111111' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ idInstalacion: 10, numero: '900000000', visible: true } as InstalacionTelefono);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    inicializarConInstalacion('10');
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, idInstalacion: 10, numero: '900111111', visible: true } as InstalacionTelefono);

    expect(component.cargando).toBeFalse();
  });
});
