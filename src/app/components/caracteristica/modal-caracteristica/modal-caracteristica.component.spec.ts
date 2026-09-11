import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ModalCaracteristicaComponent } from './modal-caracteristica.component';
import { InstalacionCaracteristicaService } from '../../../services/instalacionCaracteristica.service';
import { CaracteristicaService } from '../../../services/caracteristica.service';
import { MedidaService } from '../../../services/medida.service';
import { InstalacionCaracteristica } from '../../../models/instalacionCaracteristica';
import { Caracteristica } from '../../../models/caracteristica';
import { Medida } from '../../../models/medida';

describe('ModalCaracteristicaComponent', () => {
  let component: ModalCaracteristicaComponent;
  let fixture: ComponentFixture<ModalCaracteristicaComponent>;
  let serviceSpy: jasmine.SpyObj<InstalacionCaracteristicaService>;
  let caracteristicaServiceSpy: jasmine.SpyObj<CaracteristicaService>;
  let medidaServiceSpy: jasmine.SpyObj<MedidaService>;

  const caracteristicasMock: Caracteristica[] = [{ id: 1, nombre: 'Aforo', activo: true } as Caracteristica];
  const medidasMock: Medida[] = [{ id: 2, nombre: 'Personas', valor: 'ud', activo: true } as Medida];

  const registroExistente: InstalacionCaracteristica = {
    id: 9,
    idInstalacion: 5,
    caracteristica: { id: 1, nombre: 'Aforo' } as Caracteristica,
    medida: { id: 2, nombre: 'Personas' } as Medida,
    valor: 100,
    visible: true
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('InstalacionCaracteristicaService', ['crear', 'update']);
    caracteristicaServiceSpy = jasmine.createSpyObj('CaracteristicaService', ['getAll']);
    medidaServiceSpy = jasmine.createSpyObj('MedidaService', ['getAll']);

    caracteristicaServiceSpy.getAll.and.returnValue(of({ message: '', data: caracteristicasMock, success: true, fieldErrors: null }));
    medidaServiceSpy.getAll.and.returnValue(of({ message: '', data: medidasMock, success: true, fieldErrors: null }));
    serviceSpy.crear.and.returnValue(of({ message: '', data: true, success: true, fieldErrors: null }));
    serviceSpy.update.and.returnValue(of({ message: '', data: true, success: true, fieldErrors: null }));

    await TestBed.configureTestingModule({
      imports: [ModalCaracteristicaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: InstalacionCaracteristicaService, useValue: serviceSpy },
        { provide: CaracteristicaService, useValue: caracteristicaServiceSpy },
        { provide: MedidaService, useValue: medidaServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCaracteristicaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('idInstalacion', '5');
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('al abrir sin registroEditar, resetea el formulario a modo "Añadir"', () => {
    fixture.componentRef.setInput('registroEditar', null);
    fixture.detectChanges();

    component.modalVisible.set(true);
    fixture.detectChanges();

    expect(component.modalForm.value.id).toBeNull();
    expect(component.modalForm.value.caracteristica).toBeNull();
    expect(component.modalForm.value.visible).toBeTrue();
  });

  it('al abrir con registroEditar, precarga el formulario con sus datos', () => {
    fixture.componentRef.setInput('registroEditar', registroExistente);
    fixture.detectChanges();

    component.modalVisible.set(true);
    fixture.detectChanges();

    expect(component.modalForm.value.id).toBe(9);
    expect(component.modalForm.value.caracteristica).toBe(1);
    expect(component.modalForm.value.medida).toBe(2);
    expect(component.modalForm.value.valor).toBe(100);
    expect(component.caracteristicaSeleccionada).toBe(1);
    expect(component.medidaSeleccionada).toBe(2);
  });

  it('guardarModal() sin registroEditar llama a crear(), no a update()', () => {
    fixture.componentRef.setInput('registroEditar', null);
    fixture.detectChanges();
    component.modalVisible.set(true);
    fixture.detectChanges();
    component.modalForm.patchValue({ caracteristica: 1, valor: 50 });

    component.guardarModal();

    expect(serviceSpy.crear).toHaveBeenCalled();
    expect(serviceSpy.update).not.toHaveBeenCalled();
  });

  it('guardarModal() con registroEditar llama a update() con el id correcto, no a crear() — bug arreglado', () => {
    fixture.componentRef.setInput('registroEditar', registroExistente);
    fixture.detectChanges();
    component.modalVisible.set(true);
    fixture.detectChanges();

    component.guardarModal();

    expect(serviceSpy.update).toHaveBeenCalledWith(9, jasmine.objectContaining({ id: 9, valor: 100 }));
    expect(serviceSpy.crear).not.toHaveBeenCalled();
  });

  it('guardarModal() emite guardado y cierra el modal tras exito', () => {
    fixture.componentRef.setInput('registroEditar', registroExistente);
    fixture.detectChanges();
    component.modalVisible.set(true);
    fixture.detectChanges();

    const guardadoSpy = jasmine.createSpy('guardado');
    component.guardado.subscribe(guardadoSpy);

    component.guardarModal();

    expect(guardadoSpy).toHaveBeenCalled();
    expect(component.modalVisible()).toBeFalse();
  });

  it('guardarModal() gestiona el error del backend', () => {
    serviceSpy.update.and.returnValue(throwError(() => new Error('fallo')));
    fixture.componentRef.setInput('registroEditar', registroExistente);
    fixture.detectChanges();
    component.modalVisible.set(true);
    fixture.detectChanges();

    component.guardarModal();

    expect(component.guardando).toBeFalse();
  });

  it('guardarModal() no hace nada si el formulario es invalido', () => {
    fixture.detectChanges();
    component.modalVisible.set(true);
    fixture.detectChanges();
    component.modalForm.patchValue({ caracteristica: null, valor: null });

    component.guardarModal();

    expect(serviceSpy.crear).not.toHaveBeenCalled();
    expect(serviceSpy.update).not.toHaveBeenCalled();
  });

  it('seleccionarCaracteristica() actualiza la seleccion y el form', () => {
    fixture.detectChanges();

    component.seleccionarCaracteristica({ value: 1 });

    expect(component.caracteristicaSeleccionada).toBe(1);
    expect(component.modalForm.value.caracteristica).toBe(1);
  });

  it('seleccionarMedida() actualiza la seleccion y el form', () => {
    fixture.detectChanges();

    component.seleccionarMedida({ value: 2 });

    expect(component.medidaSeleccionada).toBe(2);
    expect(component.modalForm.value.medida).toBe(2);
  });

  it('cerrarModal() oculta el dialogo', () => {
    fixture.detectChanges();
    component.modalVisible.set(true);

    component.cerrarModal();

    expect(component.modalVisible()).toBeFalse();
  });
});
