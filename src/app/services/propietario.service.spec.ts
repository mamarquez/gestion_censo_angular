import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PropietarioService } from './propietario.service';
import { Propietario } from '../models/propietario';
import { AUTH } from '../auth/auth.constants';

describe('PropietarioService', () => {
  let service: PropietarioService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/propietarios`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(PropietarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base con los filtros como query params', () => {
    service.getAll({ nombre: 'A' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('nombre')).toBe('A');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('get() hace GET a /{id}', () => {
    service.get('1').subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('addRegistro() hace POST con los datos en el body', () => {
    const datos: Propietario = {
      id: 0,
      nombre: 'Propietario A',
      descripcion: 'Descripción',
      visible: true,
      activo: true
    };

    service.addRegistro(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('updateRegistro() hace PUT a /{id} con los datos en el body', () => {
    const datos: Propietario = {
      id: 5,
      nombre: 'Propietario A',
      descripcion: 'Descripción',
      visible: true,
      activo: true
    };

    service.updateRegistro(datos).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado(5).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('cambiarVisible() hace PATCH a /visibilidad/{id}', () => {
    service.cambiarVisible(5).subscribe();

    const req = httpMock.expectOne(`${api}/visibilidad/5`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(5).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });
});
