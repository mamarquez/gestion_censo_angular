import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ListCaracteristicasComponent } from './caracteristicas.component';
import { InstalacionCaracteristicaService } from '../../../services/instalacionCaracteristica.service';
import { DialogService } from '../../../services/dialog.service';
import { InstalacionCaracteristica } from '../../../models/instalacionCaracteristica';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('ListCaracteristicasComponent', () => {
  let component: ListCaracteristicasComponent;
  let fixture: ComponentFixture<ListCaracteristicasComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionCaracteristicaService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const caracteristicaMock: InstalacionCaracteristica = {
    id: 1,
    caracteristica: { id: 2, nombre: 'Aforo' } as any,
    medida: { id: 3, nombre: 'Personas' } as any,
    valor: 100,
    visible: true
  } as InstalacionCaracteristica;

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('InstalacionCaracteristicaService', ['getAll', 'crear', 'update', 'cambiarEstado', 'borrarRegistro']);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);
    serviceSpy.getAll.and.returnValue(of(respuesta([caracteristicaMock])));

    await TestBed.configureTestingModule({
      imports: [ListCaracteristicasComponent],
      providers: [
        { provide: InstalacionCaracteristicaService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListCaracteristicasComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnChanges() carga las características cuando cambia idEspacioDeportivo', () => {
    fixture.componentRef.setInput('idEspacioDeportivo', 5);
    component.ngOnChanges({
      idEspacioDeportivo: {
        currentValue: 5, previousValue: undefined, firstChange: true, isFirstChange: () => true
      }
    });

    expect(serviceSpy.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ instalacionEspacioDeportivo: 5 })
    );
    expect(component.caracteristicas).toEqual([caracteristicaMock]);
  });

  it('cargar() no hace nada si idEspacioDeportivo es undefined', () => {
    fixture.detectChanges();
    serviceSpy.getAll.calls.reset();

    component.buscar();

    expect(serviceSpy.getAll).not.toHaveBeenCalled();
  });

  it('guardar() en creación envía instalacionEspacioDeportivo (no idEspacioDeportivo) al backend', () => {
    fixture.componentRef.setInput('idEspacioDeportivo', 7);
    fixture.detectChanges();
    serviceSpy.crear.and.returnValue(of(respuesta(true)));

    component.guardar({ valor: 50, visible: true } as InstalacionCaracteristica);

    expect(serviceSpy.crear).toHaveBeenCalledTimes(1);
    const payload = serviceSpy.crear.calls.mostRecent().args[0] as any;
    expect(payload.instalacionEspacioDeportivo).toBe(7);
    expect(payload.idEspacioDeportivo).toBeUndefined();
    expect(payload.idInstalacion).toBeNull();
  });

  it('guardar() en edición llama a update() con el id existente', () => {
    fixture.componentRef.setInput('idEspacioDeportivo', 7);
    fixture.detectChanges();
    serviceSpy.update.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, valor: 50, visible: true } as InstalacionCaracteristica);

    expect(serviceSpy.update).toHaveBeenCalledWith(1, jasmine.objectContaining({ instalacionEspacioDeportivo: 7 }));
  });

  it('guardar() notifica error si falla', () => {
    fixture.componentRef.setInput('idEspacioDeportivo', 7);
    fixture.detectChanges();
    serviceSpy.crear.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ valor: 50, visible: true } as InstalacionCaracteristica);

    expect(component.modalVisible).toBeFalse();
  });

  it('cambiarVisible() alterna el estado de visibilidad', () => {
    fixture.componentRef.setInput('idEspacioDeportivo', 7);
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarVisible(1);

    expect(component.caracteristicas[0].visible).toBeFalse();
  });

  it('confirmarBorrado() invoca DialogService.confirmar()', () => {
    fixture.componentRef.setInput('idEspacioDeportivo', 7);
    fixture.detectChanges();

    component.confirmarBorrado(caracteristicaMock);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
  });
});
