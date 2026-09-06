import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ComunidadautonomaService } from './comunidadautonoma.service';
import { ComunidadAutonoma } from '../models/comunidadautonoma';
import { AUTH } from '../auth/auth.constants';

describe('ComunidadautonomaService', () => {
  let service: ComunidadautonomaService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/comunidadesautonomicas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ComunidadautonomaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base con los filtros como query params', () => {
    service.getAll({ nombre: 'Madrid' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('nombre')).toBe('Madrid');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('get() hace GET a /{id}', () => {
    service.get('7').subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('addRegistro() hace POST con la comunidad autónoma en el body', () => {
    const datos = {
      codigo: 'MD',
      nombre: 'Madrid',
      activo: true
    } as ComunidadAutonoma;

    service.addRegistro(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('updateRegistro() hace PUT a /{id} con los datos en el body', () => {
    const datos = {
      id: 7,
      codigo: 'MD',
      nombre: 'Madrid',
      activo: true
    } as ComunidadAutonoma;

    service.updateRegistro(datos).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });
});
