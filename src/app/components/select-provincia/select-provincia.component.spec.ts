import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SelectProvinciaComponent } from './select-provincia.component';
import { ProvinciaService } from '../../services/provincia.service';
import { Provincia } from '../../models/provincia';

describe('SelectProvinciaComponent', () => {
  let component: SelectProvinciaComponent;
  let fixture: ComponentFixture<SelectProvinciaComponent>;
  let serviceSpy: jasmine.SpyObj<ProvinciaService>;

  const provinciasMock: Provincia[] = [{ id: 1, nombre: 'Málaga', activo: true } as Provincia];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ProvinciaService', ['getAll']);
    serviceSpy.getAll.and.returnValue(of({ message: '', data: provinciasMock, success: true, fieldErrors: null }));

    await TestBed.configureTestingModule({
      imports: [SelectProvinciaComponent],
      providers: [{ provide: ProvinciaService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectProvinciaComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga las provincias al iniciar', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith({ activo: true });
    expect(component.provincias).toEqual(provinciasMock);
    expect(component.cargandoProvincias).toBeFalse();
  });

  it('deja de cargar si la petición falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    expect(component.cargandoProvincias).toBeFalse();
    expect(component.provincias).toEqual([]);
  });

  it('trata una respuesta sin data como lista vacía', () => {
    serviceSpy.getAll.and.returnValue(of({ message: '', data: null, success: true, fieldErrors: null } as any));
    fixture.detectChanges();

    expect(component.provincias).toEqual([]);
  });

  it('seleccionar() actualiza value y notifica onChange/onTouched', () => {
    fixture.detectChanges();

    const onChange = jasmine.createSpy('onChange');
    const onTouched = jasmine.createSpy('onTouched');
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.seleccionar({ value: 1 });

    expect(component.value).toBe(1);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(onTouched).toHaveBeenCalled();
  });

  it('writeValue() asigna el valor recibido', () => {
    fixture.detectChanges();
    component.writeValue(2);
    expect(component.value).toBe(2);
  });

  it('setDisabledState() actualiza la señal disabled', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.disabled()).toBeTrue();
    component.setDisabledState(false);
    expect(component.disabled()).toBeFalse();
  });
});
