import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InstalacionTelefonoService } from './instalaciontelefono.service';
import { InstalacionTelefono } from '../models/instalaciontelefono';
import { AUTH } from '../auth/auth.constants';

describe('InstalacionTelefonoService', () => {
  let service: InstalacionTelefonoService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/instalacionestelefonos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(InstalacionTelefonoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base con los filtros como query params', () => {
    service.getAll({ idInstalacion: '1' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('idInstalacion')).toBe('1');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('get() hace GET a /{id}', () => {
    service.get(1).subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('getTelefonos() hace GET a /{id}', () => {
    service.getTelefonos(1).subscribe();

    const req = httpMock.expectOne(`${api}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: '', data: [], success: true, fieldErrors: null });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado(5).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('addRegistro() hace POST con los datos en el body', () => {
    const telefono: Partial<InstalacionTelefono> = {
      idInstalacion: 1,
      numero: '600123456',
      contacto: 'Recepción',
      visible: true
    };

    service.addRegistro(telefono).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(telefono);
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('updateRegistro() hace PUT a /{id} con los datos en el body', () => {
    const telefono: Partial<InstalacionTelefono> = {
      id: 5,
      idInstalacion: 1,
      numero: '600123456',
      contacto: 'Recepción',
      visible: true
    };

    service.updateRegistro(telefono).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(telefono);
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(5).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });
});
