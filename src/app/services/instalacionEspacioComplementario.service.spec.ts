import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InstalacionEspacioComplementarioService } from './instalacionEspacioComplementario.service';
import { InstalacionEspacioComplementario } from '../models/instalacionEspacioComplementario';
import { AUTH } from '../auth/auth.constants';

describe('InstalacionEspacioComplementarioService', () => {
  let service: InstalacionEspacioComplementarioService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/instalacionesespacioscomplementarios`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(InstalacionEspacioComplementarioService);
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
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('cambiarVisible() hace PATCH a /visibilidad/{id}', () => {
    service.cambiarVisible(7).subscribe();

    const req = httpMock.expectOne(`${api}/visibilidad/7`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('crear() hace POST con el espacio complementario en el body', () => {
    const datos: Partial<InstalacionEspacioComplementario> = {
      idInstalacion: 10,
      espacioComplementario: { id: 1 } as any,
      visible: true
    };

    service.crear(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });

  it('update() hace PUT a /{id}', () => {
    const datos = {
      id: 7,
      idInstalacion: 10,
      espacioComplementario: { id: 1 } as any,
      visible: true
    } as InstalacionEspacioComplementario;

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
    req.flush({ message: '', data: {}, success: true, fieldErrors: null });
  });
});
