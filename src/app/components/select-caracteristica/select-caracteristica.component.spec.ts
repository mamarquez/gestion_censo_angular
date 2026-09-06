import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SelectCaracteristicaComponent } from './select-caracteristica.component';
import { CaracteristicaService } from '../../services/caracteristica.service';
import { Caracteristica } from '../../models/caracteristica';

describe('SelectCaracteristicaComponent', () => {
  let component: SelectCaracteristicaComponent;
  let fixture: ComponentFixture<SelectCaracteristicaComponent>;
  let serviceSpy: jasmine.SpyObj<CaracteristicaService>;

  const caracteristicasMock: Caracteristica[] = [{ id: 1, nombre: 'Aforo', activo: true } as Caracteristica];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('CaracteristicaService', ['getAll']);
    serviceSpy.getAll.and.returnValue(of({ message: '', data: caracteristicasMock, success: true, fieldErrors: null }));

    await TestBed.configureTestingModule({
      imports: [SelectCaracteristicaComponent],
      providers: [{ provide: CaracteristicaService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectCaracteristicaComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga las características al iniciar', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith({ activo: true });
    expect(component.caracteristicas()).toEqual(caracteristicasMock);
    expect(component.cargando()).toBeFalse();
  });

  it('deja de cargar si la petición falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.caracteristicas()).toEqual([]);
  });

  it('seleccionar() actualiza value y notifica onChange/onTouched', () => {
    fixture.detectChanges();

    const onChange = jasmine.createSpy('onChange');
    const onTouched = jasmine.createSpy('onTouched');
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.seleccionar({ value: 9 });

    expect(component.value).toBe(9);
    expect(onChange).toHaveBeenCalledWith(9);
    expect(onTouched).toHaveBeenCalled();
  });

  it('writeValue() asigna el valor recibido', () => {
    fixture.detectChanges();
    component.writeValue(6);
    expect(component.value).toBe(6);
  });

  it('setDisabledState() actualiza la señal disabled', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.disabled()).toBeTrue();
    component.setDisabledState(false);
    expect(component.disabled()).toBeFalse();
  });
});
