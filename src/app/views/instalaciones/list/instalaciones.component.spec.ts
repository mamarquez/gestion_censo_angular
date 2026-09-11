import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ListInstalacionesComponent } from './instalaciones.component';
import { InstalacionService } from '../../../services/instalacion.service';
import { Instalacion } from '../../../models/instalacion';

describe('ListInstalacionesComponent', () => {
  let component: ListInstalacionesComponent;
  let fixture: ComponentFixture<ListInstalacionesComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const instalacionesMock: Instalacion[] = [
    { id: 1, codigo: 'COD001', nombre: 'Polideportivo', visible: true, baja: false } as Instalacion
  ];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('InstalacionService', [
      'getAll', 'cambiarVisible', 'cambiarEstado', 'borrarRegistro'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    serviceSpy.getAll.and.returnValue(of({
      message: '', data: instalacionesMock, success: true, fieldErrors: null,
      totalRegistros: 1, totalPaginas: 1, paginaActual: 0, tamanoPagina: 10
    }));

    await TestBed.configureTestingModule({
      imports: [ListInstalacionesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        MessageService,
        ConfirmationService,
        { provide: InstalacionService, useValue: serviceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListInstalacionesComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('cargarPagina() ignora el onLazyLoad automatico inicial hasta que se conozca el tamano real de pagina', () => {
    fixture.detectChanges();

    component.cargarPagina({ first: 0, rows: 10 });

    expect(serviceSpy.getAll).not.toHaveBeenCalled();
    expect(component.instalaciones).toEqual([]);
  });

  it('cargarPagina() pide la pagina 0 cuando se fuerza (onFilasChange/buscar)', () => {
    fixture.detectChanges();

    component.cargarPagina({ first: 0, rows: 10 }, true);

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ page: 0, size: 10 }));
    expect(component.instalaciones).toEqual(instalacionesMock);
    expect(component.totalRegistros).toBe(1);
    expect(component.cargando).toBeFalse();
  });

  it('cargarPagina() calcula la pagina correcta a partir de first/rows', () => {
    fixture.detectChanges();

    component.cargarPagina({ first: 20, rows: 10 }, true);

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ page: 2, size: 10 }));
  });

  it('onFilasChange() actualiza filasPorPagina, resetea a la primera pagina y dispara la carga real la primera vez', () => {
    fixture.detectChanges();
    component.primeraPagina = 10;

    component.onFilasChange(17);

    expect(component.filasPorPagina).toBe(17);
    expect(component.primeraPagina).toBe(0);
    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ page: 0, size: 17 }));
  });

  it('onFilasChange() en llamadas posteriores (resize) no vuelve a forzar una carga', () => {
    fixture.detectChanges();
    component.onFilasChange(17);
    serviceSpy.getAll.calls.reset();

    component.onFilasChange(12);

    expect(serviceSpy.getAll).not.toHaveBeenCalled();
  });

  it('cargarPagina() trata una respuesta sin data como lista vacia', () => {
    serviceSpy.getAll.and.returnValue(of({ message: '', data: null, success: true, fieldErrors: null } as any));
    fixture.detectChanges();

    component.cargarPagina({ first: 0, rows: 10 }, true);

    expect(component.instalaciones).toEqual([]);
    expect(component.totalRegistros).toBe(0);
  });

  it('cargarPagina() gestiona el error del backend', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    component.cargarPagina({ first: 0, rows: 10 }, true);

    expect(component.instalaciones).toEqual([]);
    expect(component.totalRegistros).toBe(0);
    expect(component.cargando).toBeFalse();
  });

  it('buscar() reinicia a la primera pagina y consulta con los filtros actuales', () => {
    fixture.detectChanges();
    component.form.patchValue({ codigo: 'COD001' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ codigo: 'COD001', page: 0 }));
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ codigo: 'COD001' });

    component.limpiar();

    expect(component.form.value.codigo).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('editar() navega al detalle de la instalacion', () => {
    fixture.detectChanges();

    component.editar('1');

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instalaciones', '1']);
  });

  it('cambiarVisible() invierte la visibilidad local tras exito', () => {
    serviceSpy.cambiarVisible.and.returnValue(of({ message: '', data: true, success: true, fieldErrors: null }));
    fixture.detectChanges();
    component.cargarPagina({ first: 0, rows: 10 }, true);

    component.cambiarVisible(1);

    expect(component.instalaciones[0].visible).toBeFalse();
  });

  it('cambiarVisible() gestiona el error del backend', () => {
    serviceSpy.cambiarVisible.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();
    component.cargarPagina({ first: 0, rows: 10 }, true);

    component.cambiarVisible(1);

    expect(component.cargando).toBeFalse();
  });

  it('cambiarEstado() invierte la baja local tras exito', () => {
    serviceSpy.cambiarEstado.and.returnValue(of({ message: '', data: true, success: true, fieldErrors: null }));
    fixture.detectChanges();
    component.cargarPagina({ first: 0, rows: 10 }, true);

    component.cambiarEstado(1);

    expect(component.instalaciones[0].baja).toBeTrue();
  });

  it('cambiarEstado() gestiona el error del backend', () => {
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();
    component.cargarPagina({ first: 0, rows: 10 }, true);

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() -> borrarRegistro() elimina la instalacion de la lista tras confirmar', () => {
    serviceSpy.borrarRegistro.and.returnValue(of({ message: '', data: true, success: true, fieldErrors: null }));
    fixture.detectChanges();
    component.cargarPagina({ first: 0, rows: 10 }, true);

    component.confirmarBorrado(instalacionesMock[0]);

    const confirmService = TestBed.inject(ConfirmationService);
    spyOn(confirmService, 'confirm').and.callFake((config: any) => {
      config.accept();
      return confirmService;
    });

    component.confirmarBorrado(instalacionesMock[0]);

    expect(component.instalaciones).toEqual([]);
  });

  it('confirmarBorrado() gestiona el error del backend', () => {
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();
    component.cargarPagina({ first: 0, rows: 10 }, true);

    const confirmService = TestBed.inject(ConfirmationService);
    spyOn(confirmService, 'confirm').and.callFake((config: any) => {
      config.accept();
      return confirmService;
    });

    component.confirmarBorrado(instalacionesMock[0]);

    expect(component.cargando).toBeFalse();
  });
});
