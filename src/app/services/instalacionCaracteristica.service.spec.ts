import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InstalacionCaracteristicaService } from './instalacionCaracteristica.service';
import { InstalacionCaracteristica } from '../models/instalacionCaracteristica';
import { AUTH } from '../auth/auth.constants';

describe('InstalacionCaracteristicaService', () => {
  let service: InstalacionCaracteristicaService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/instalacionescaracteristicas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(InstalacionCaracteristicaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base con los filtros como query params', () => {
    service.getAll({ idInstalacion: '10' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('idInstalacion')).toBe('10');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('get() hace GET a /{id}', () => {
    service.get(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('crear() hace POST con la característica en el body', () => {
    const datos: InstalacionCaracteristica = {
      idInstalacion: 10,
      idEspacioDeportivo: null,
      caracteristica: { id: 1 } as any,
      medida: null,
      valor: 5,
      visible: true
    };

    service.crear(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('update() hace PUT a /{id} con los datos en el body', () => {
    const datos: InstalacionCaracteristica = {
      id: 7,
      idInstalacion: 10,
      idEspacioDeportivo: null,
      caracteristica: { id: 1 } as any,
      medida: null,
      valor: 5,
      visible: true
    };

    service.update(7, datos).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });
});
