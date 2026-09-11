import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DatosCaracteristicaComponent } from './caracteristica.component';
import { InstalacionCaracteristicaService } from '../../../../../services/instalacionCaracteristica.service';
import { DialogService } from '../../../../../services/dialog.service';
import { InstalacionCaracteristica } from '../../../../../models/instalacionCaracteristica';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

describe('DatosCaracteristicaComponent', () => {
  let component: DatosCaracteristicaComponent;
  let fixture: ComponentFixture<DatosCaracteristicaComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionCaracteristicaService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const caracteristicaMock: InstalacionCaracteristica = {
    id: 1,
    caracteristica: { id: 2, nombre: 'Aforo' } as any,
    medida: { id: 3, nombre: 'Personas' } as any,
    valor: 100,
    visible: true
  } as InstalacionCaracteristica;

  const respuesta = (data: any): ApiResponseWrapper<any> => ({ message: '', data, success: true, fieldErrors: null });

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('InstalacionCaracteristicaService', [
      'getAll', 'cambiarEstado', 'borrarRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);
    serviceSpy.getAll.and.returnValue(of(respuesta([caracteristicaMock])));

    await TestBed.configureTestingModule({
      imports: [DatosCaracteristicaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: InstalacionCaracteristicaService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '10' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatosCaracteristicaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('idInstalacion', '10');
  });

  it('se crea correctamente y carga datos en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ idInstalacion: '10' }));
    expect(component.caracteristicas).toEqual([caracteristicaMock]);
  });

  it('abrirModal() abre el modal en modo "Añadir" (sin registro a editar)', () => {
    fixture.detectChanges();
    component.caracteristicaEditar = caracteristicaMock;

    component.abrirModal();

    expect(component.modalVisible).toBeTrue();
    expect(component.caracteristicaEditar).toBeNull();
  });

  it('editar() abre el modal con el registro seleccionado — bug arreglado (antes no existía)', () => {
    fixture.detectChanges();

    component.editar(caracteristicaMock);

    expect(component.modalVisible).toBeTrue();
    expect(component.caracteristicaEditar).toEqual(caracteristicaMock);
  });

  it('limpiar() resetea el formulario y recarga', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Aforo' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('buscar() recarga con los filtros actuales', () => {
    fixture.detectChanges();
    serviceSpy.getAll.calls.reset();
    component.form.patchValue({ nombre: 'Aforo' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Aforo' }));
  });

  it('cargarDatos() gestiona el error del backend', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
  });

  it('cambiarVisible() alterna la visibilidad local tras exito', () => {
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));
    fixture.detectChanges();

    component.cambiarVisible(1);

    expect(component.caracteristicas[0].visible).toBeFalse();
  });

  it('cambiarVisible() gestiona el error del backend', () => {
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    component.cambiarVisible(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() invoca DialogService.confirmar()', () => {
    fixture.detectChanges();

    component.confirmarBorrado(caracteristicaMock);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
  });

  it('confirmarBorrado() -> borrarRegistro() elimina el registro de la lista tras confirmar', () => {
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake((opts: any) => opts.onAccept());
    fixture.detectChanges();

    component.confirmarBorrado(caracteristicaMock);

    expect(component.caracteristicas).toEqual([]);
  });

  it('confirmarBorrado() gestiona el error del backend', () => {
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake((opts: any) => opts.onAccept());
    fixture.detectChanges();

    component.confirmarBorrado(caracteristicaMock);

    expect(component.caracteristicas).toEqual([caracteristicaMock]);
  });
});
