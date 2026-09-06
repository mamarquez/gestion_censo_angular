import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InstalacionRutaCoordenadaService } from './instalacionRutaCoordenada.service';
import { InstalacionRutaCoordenada } from '../models/instalacionRutaCoordenada';
import { AUTH } from '../auth/auth.constants';

describe('InstalacionRutaCoordenadaService', () => {
  let service: InstalacionRutaCoordenadaService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/instalacionesrutascoordenadas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(InstalacionRutaCoordenadaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base con los filtros como query params', () => {
    service.getAll({ idRuta: '1' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('idRuta')).toBe('1');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('crear() hace POST a la URL base con id null, idRuta, x e y en el body', () => {
    const coordenada: Partial<InstalacionRutaCoordenada> = { x: 10, y: 20 };

    service.crear(1, coordenada).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ id: null, idRuta: 1, x: 10, y: 20 });
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('actualizar() hace PUT a /{id} con id, idRuta, x e y en el body', () => {
    const coordenada: Partial<InstalacionRutaCoordenada> = { x: 15, y: 25 };

    service.actualizar(5, 1, coordenada).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ id: 5, idRuta: 1, x: 15, y: 25 });
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(5).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });
});
