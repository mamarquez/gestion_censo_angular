import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SelectMedidaComponent } from './select-medida.component';
import { MedidaService } from '../../services/medida.service';
import { Medida } from '../../models/medida';

describe('SelectMedidaComponent', () => {
  let component: SelectMedidaComponent;
  let fixture: ComponentFixture<SelectMedidaComponent>;
  let serviceSpy: jasmine.SpyObj<MedidaService>;

  const medidasMock: Medida[] = [{ id: 1, nombre: 'Metros', activo: true } as Medida];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('MedidaService', ['getAll']);
    serviceSpy.getAll.and.returnValue(of({ message: '', data: medidasMock, success: true, fieldErrors: null }));

    await TestBed.configureTestingModule({
      imports: [SelectMedidaComponent],
      providers: [{ provide: MedidaService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMedidaComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga las medidas al iniciar', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith({ activo: true });
    expect(component.medidas()).toEqual(medidasMock);
    expect(component.cargando()).toBeFalse();
  });

  it('deja de cargar si la petición falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.medidas()).toEqual([]);
  });

  it('seleccionar() actualiza value y notifica onChange/onTouched', () => {
    fixture.detectChanges();

    const onChange = jasmine.createSpy('onChange');
    const onTouched = jasmine.createSpy('onTouched');
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.seleccionar({ value: 2 });

    expect(component.value).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
    expect(onTouched).toHaveBeenCalled();
  });

  it('writeValue() asigna el valor recibido', () => {
    fixture.detectChanges();
    component.writeValue(4);
    expect(component.value).toBe(4);
  });

  it('setDisabledState() actualiza la señal disabled', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.disabled()).toBeTrue();
    component.setDisabledState(false);
    expect(component.disabled()).toBeFalse();
  });
});
