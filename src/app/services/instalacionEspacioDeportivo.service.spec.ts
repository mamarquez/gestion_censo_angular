import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InstalacionEspacioDeportivoService } from './instalacionEspacioDeportivo.service';
import { InstalacionEspacioDeportivo } from '../models/instalacionEspacioDeportivo';
import { AUTH } from '../auth/auth.constants';

describe('InstalacionEspacioDeportivoService', () => {
  let service: InstalacionEspacioDeportivoService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/instalacionesespaciosdeportivos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(InstalacionEspacioDeportivoService);
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
    req.flush({ message: '', data: [], success: true });
  });

  it('get() hace GET a /{id}', () => {
    service.get(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: {}, success: true });
  });

  it('crear() hace POST con el espacio deportivo en el body', () => {
    const datos: Partial<InstalacionEspacioDeportivo> = {
      instalacion: { id: 10 } as any,
      nombre: 'Pista de pádel',
      descripcion: 'Pista cubierta',
      visible: true
    };

    service.crear(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true });
  });

  it('update() hace PUT a /{id}', () => {
    const datos = {
      id: 7,
      instalacion: { id: 10 } as any,
      nombre: 'Pista de pádel',
      descripcion: 'Pista cubierta',
      visible: true
    } as InstalacionEspacioDeportivo;

    service.update(7, datos).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    req.flush({ message: '', data: true, success: true });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: true, success: true });
  });
});
