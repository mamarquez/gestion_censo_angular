import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
  let service: DialogService;
  let confirmationService: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmationService]
    });

    service = TestBed.inject(DialogService);
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('confirmar() delega en ConfirmationService.confirm() con los valores por defecto', () => {
    const confirmSpy = spyOn(confirmationService, 'confirm');
    const onAccept = jasmine.createSpy('onAccept');

    service.confirmar({ mensaje: '¿Seguro?', onAccept });

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    const config = confirmSpy.calls.mostRecent().args[0];
    expect(config.message).toBe('¿Seguro?');
    expect(config.header).toBe('Confirmación');
    expect(config.acceptLabel).toBe('Aceptar');
    expect(config.rejectLabel).toBe('Cancelar');
    expect(config.acceptButtonStyleClass).toBe('p-button-danger p-button-sm');
  });

  it('confirmar() respeta título y labels personalizados', () => {
    const confirmSpy = spyOn(confirmationService, 'confirm');
    const onAccept = jasmine.createSpy('onAccept');

    service.confirmar({
      mensaje: 'Mensaje',
      titulo: 'Otro título',
      labelAceptar: 'Sí',
      labelCancelar: 'No',
      onAccept
    });

    const config = confirmSpy.calls.mostRecent().args[0];
    expect(config.header).toBe('Otro título');
    expect(config.acceptLabel).toBe('Sí');
    expect(config.rejectLabel).toBe('No');
  });

  it('confirmar() usa estilo no peligroso cuando esPeligroso es false', () => {
    const confirmSpy = spyOn(confirmationService, 'confirm');
    const onAccept = jasmine.createSpy('onAccept');

    service.confirmar({ mensaje: 'Mensaje', esPeligroso: false, onAccept });

    const config = confirmSpy.calls.mostRecent().args[0];
    expect(config.acceptButtonStyleClass).toBe('p-button-primary p-button-sm');
  });

  it('confirmar() invoca onAccept cuando ConfirmationService acepta', () => {
    const onAccept = jasmine.createSpy('onAccept');
    spyOn(confirmationService, 'confirm').and.callFake((config: any) => {
      config.accept();
      return confirmationService;
    });

    service.confirmar({ mensaje: 'Mensaje', onAccept });

    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('confirmar() invoca onReject cuando ConfirmationService rechaza', () => {
    const onAccept = jasmine.createSpy('onAccept');
    const onReject = jasmine.createSpy('onReject');
    spyOn(confirmationService, 'confirm').and.callFake((config: any) => {
      config.reject();
      return confirmationService;
    });

    service.confirmar({ mensaje: 'Mensaje', onAccept, onReject });

    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('confirmar() no falla si se rechaza sin onReject definido', () => {
    const onAccept = jasmine.createSpy('onAccept');
    spyOn(confirmationService, 'confirm').and.callFake((config: any) => {
      expect(() => config.reject()).not.toThrow();
      return confirmationService;
    });

    service.confirmar({ mensaje: 'Mensaje', onAccept });
  });
});
