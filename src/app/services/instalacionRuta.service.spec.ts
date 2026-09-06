import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InstalacionRutaService } from './instalacionRuta.service';
import { InstalacionRuta } from '../models/instalacionRuta';
import { AUTH } from '../auth/auth.constants';

describe('InstalacionRutaService', () => {
  let service: InstalacionRutaService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/instalacionesrutas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(InstalacionRutaService);
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
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('crear() hace POST con la ruta en el body', () => {
    const datos: Partial<InstalacionRuta> = {
      idInstalacion: 10,
      nombre: 'Ruta del río',
      descripcion: 'Ruta señalizada',
      visible: true
    };

    service.crear(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('actualizar() hace PUT a /{id} combinando id, idInstalacion y datos de la ruta', () => {
    const ruta = { nombre: 'Ruta del río', descripcion: 'Ruta señalizada', visible: true, activo: true };

    service.actualizar(7, 10, ruta).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ id: 7, idInstalacion: 10, ...ruta });
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('descargarFichero() hace GET a /descargar/{idRuta} con responseType blob', () => {
    const blob = new Blob(['contenido kml'], { type: 'application/octet-stream' });

    service.descargarFichero(7).subscribe();

    const req = httpMock.expectOne(`${api}/descargar/7`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(blob);
  });
});
