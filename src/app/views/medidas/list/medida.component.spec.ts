import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { MedidaComponent } from './medida.component';
import { MedidaService } from '../../../services/medida.service';
import { DialogService } from '../../../services/dialog.service';
import { Medida } from '../../../models/medida';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

describe('MedidaComponent', () => {
  let component: MedidaComponent;
  let fixture: ComponentFixture<MedidaComponent>;
  let serviceSpy: jasmine.SpyObj<MedidaService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;

  const crearMedidasMock = (): Medida[] => [
    { id: 1, nombre: 'Metros cuadrados', descripcion: 'Superficie', valor: 'm2', activo: true },
    { id: 2, nombre: 'Unidades', descripcion: 'Cantidad', valor: 'ud', activo: false }
  ];
  let medidasMock: Medida[];

  const respuesta = (data: any): ApiResponseWrapper<any> => ({
    message: '',
    data,
    success: true,
    fieldErrors: null
  });

  beforeEach(async () => {
    medidasMock = crearMedidasMock();
    serviceSpy = jasmine.createSpyObj('MedidaService', [
      'getAll', 'get', 'cambiarEstado', 'borrarRegistro', 'addRegistro', 'updateRegistro'
    ]);
    dialogServiceSpy = jasmine.createSpyObj('DialogService', ['confirmar']);

    serviceSpy.getAll.and.returnValue(of(respuesta(medidasMock)));

    await TestBed.configureTestingModule({
      imports: [MedidaComponent],
      providers: [
        { provide: MedidaService, useValue: serviceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MedidaComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente y carga el listado en ngOnInit', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(serviceSpy.getAll).toHaveBeenCalledWith();
    expect(component.medidas.length).toBe(2);
    expect(component.cargando).toBeFalse();
  });

  it('cargar() notifica error si falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
  });

  it('buscar() aplica los filtros del formulario', () => {
    fixture.detectChanges();
    serviceSpy.getAll.calls.reset();
    component.form.patchValue({ nombre: 'Metros' });

    component.buscar();

    expect(serviceSpy.getAll).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Metros' }));
    expect(component.cargando).toBeFalse();
  });

  it('buscar() vacía el listado si la respuesta no trae un array', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(of(respuesta(null)));

    component.buscar();

    expect(component.medidas).toEqual([]);
  });

  it('buscar() notifica error y vacía el listado si falla', () => {
    fixture.detectChanges();
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));

    component.buscar();

    expect(component.cargando).toBeFalse();
    expect(component.medidas).toEqual([]);
  });

  it('limpiar() resetea el formulario y vuelve a buscar', () => {
    fixture.detectChanges();
    component.form.patchValue({ nombre: 'Metros' });
    serviceSpy.getAll.calls.reset();

    component.limpiar();

    expect(component.form.value.nombre).toBeNull();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('cambiarEstado() invierte el estado activo de la medida afectada', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(of(respuesta(true)));

    component.cambiarEstado(1);

    expect(serviceSpy.cambiarEstado).toHaveBeenCalledWith(1);
    expect(component.medidas.find(m => m.id === 1)?.activo).toBeFalse();
  });

  it('cambiarEstado() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.cambiarEstado.and.returnValue(throwError(() => new Error('fallo')));

    component.cambiarEstado(1);

    expect(component.cargando).toBeFalse();
  });

  it('confirmarBorrado() delega en DialogService con el nombre de la medida', () => {
    fixture.detectChanges();
    const medida = component.medidas.find(m => m.id === 1)!;

    component.confirmarBorrado(medida);

    expect(dialogServiceSpy.confirmar).toHaveBeenCalled();
    const config = dialogServiceSpy.confirmar.calls.mostRecent().args[0];
    expect(config.mensaje).toContain('Metros cuadrados');
  });

  it('confirmarBorrado() -> onAccept borra el registro y lo quita del listado', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(of(respuesta(true)));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const medida = component.medidas.find(m => m.id === 1)!;

    component.confirmarBorrado(medida);

    expect(serviceSpy.borrarRegistro).toHaveBeenCalledWith(1);
    expect(component.medidas.find(m => m.id === 1)).toBeUndefined();
  });

  it('borrarRegistro() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.borrarRegistro.and.returnValue(throwError(() => new Error('fallo')));
    dialogServiceSpy.confirmar.and.callFake(config => config.onAccept());
    const medida = component.medidas.find(m => m.id === 1)!;

    component.confirmarBorrado(medida);

    expect(component.cargando).toBeFalse();
  });

  it('abrirModal() limpia la medida seleccionada y abre el modal', () => {
    fixture.detectChanges();
    component.medida = medidasMock[0];

    component.abrirModal();

    expect(component.medida).toBeNull();
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() carga la medida y abre el modal', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(medidasMock[0])));

    component.editar('1');

    expect(serviceSpy.get).toHaveBeenCalledWith('1');
    expect(component.medida).toEqual(medidasMock[0]);
    expect(component.modalVisible).toBeTrue();
  });

  it('editar() no abre el modal si la respuesta no trae datos', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(of(respuesta(null)));

    component.editar('1');

    expect(component.modalVisible).toBeFalse();
  });

  it('editar() notifica error si falla', () => {
    fixture.detectChanges();
    serviceSpy.get.and.returnValue(throwError(() => new Error('fallo')));

    component.editar('1');

    expect(component.cargando).toBeFalse();
  });

  it('guardar() sin id llama a addRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(of(respuesta(true)));
    serviceSpy.getAll.calls.reset();

    component.guardar({ nombre: 'Nueva medida', descripcion: 'desc', valor: 'kg', activo: true } as Medida);

    expect(serviceSpy.addRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ nombre: 'Nueva medida' }));
    expect(component.modalVisible).toBeFalse();
    expect(serviceSpy.getAll).toHaveBeenCalled();
  });

  it('guardar() con id llama a updateRegistro() y recarga el listado', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(of(respuesta(true)));

    component.guardar({ id: 1, nombre: 'Metros renombrados', valor: 'm2', activo: true } as Medida);

    expect(serviceSpy.updateRegistro).toHaveBeenCalledWith(jasmine.objectContaining({ id: 1, nombre: 'Metros renombrados' }));
  });

  it('guardar() notifica error si addRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.addRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ nombre: 'Nueva medida', activo: true } as Medida);

    expect(component.cargando).toBeFalse();
  });

  it('guardar() notifica error si updateRegistro falla', () => {
    fixture.detectChanges();
    serviceSpy.updateRegistro.and.returnValue(throwError(() => new Error('fallo')));

    component.guardar({ id: 1, nombre: 'Metros renombrados', activo: true } as Medida);

    expect(component.cargando).toBeFalse();
  });
});
