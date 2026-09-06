import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SelectMunicipioComponent } from './select-provincia.component';
import { MunicipioService } from '../../services/municipio.service';
import { Municipio } from '../../models/municipio';

describe('SelectMunicipioComponent', () => {
  let component: SelectMunicipioComponent;
  let fixture: ComponentFixture<SelectMunicipioComponent>;
  let serviceSpy: jasmine.SpyObj<MunicipioService>;

  const municipiosMock: Municipio[] = [{ id: 1, nombre: 'Málaga', activo: true } as Municipio];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('MunicipioService', ['getAll']);
    serviceSpy.getAll.and.returnValue(of({ message: '', data: municipiosMock, success: true, fieldErrors: null }));

    await TestBed.configureTestingModule({
      imports: [SelectMunicipioComponent],
      providers: [{ provide: MunicipioService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMunicipioComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('carga el catálogo completo cuando no hay idProvincia', () => {
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith({ activo: true });
    expect(component.municipios).toEqual(municipiosMock);
    expect(component.cargandoMunicipios).toBeFalse();
  });

  it('filtra por idProvincia cuando se establece', () => {
    fixture.componentRef.setInput('idProvincia', 29);
    fixture.detectChanges();

    expect(serviceSpy.getAll).toHaveBeenCalledWith({ activo: true, idProvincia: 29 });
  });

  it('deja de cargar si la petición falla', () => {
    serviceSpy.getAll.and.returnValue(throwError(() => new Error('fallo')));
    fixture.detectChanges();

    expect(component.cargandoMunicipios).toBeFalse();
    expect(component.municipios).toEqual([]);
  });

  it('seleccionar() actualiza value y notifica onChange/onTouched', () => {
    fixture.detectChanges();

    const onChange = jasmine.createSpy('onChange');
    const onTouched = jasmine.createSpy('onTouched');
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.seleccionar({ value: 5 });

    expect(component.value).toBe(5);
    expect(onChange).toHaveBeenCalledWith(5);
    expect(onTouched).toHaveBeenCalled();
  });

  it('writeValue() asigna el valor recibido', () => {
    fixture.detectChanges();
    component.writeValue(3);
    expect(component.value).toBe(3);
  });

  it('setDisabledState() actualiza la señal disabled', () => {
    fixture.detectChanges();
    component.setDisabledState(true);
    expect(component.disabled()).toBeTrue();
    component.setDisabledState(false);
    expect(component.disabled()).toBeFalse();
  });
});
