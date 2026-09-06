import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ImagenService } from './imagen.service';
import { Imagen } from '../models/imagen';
import { AUTH } from '../auth/auth.constants';

describe('ImagenService', () => {
  let service: ImagenService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/instalacionesgaleria`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ImagenService);
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

  it('descargar() hace GET a /images/{nombre} con responseType blob y filtros como query params', () => {
    const blob = new Blob(['contenido'], { type: 'image/png' });

    service.descargar('foto.png', { idInstalacion: '10' }).subscribe();

    const req = httpMock.expectOne(request => request.url === `${api}/images/foto.png` && request.method === 'GET');
    expect(req.request.responseType).toBe('blob');
    expect(req.request.params.get('idInstalacion')).toBe('10');
    req.flush(blob);
  });

  it('addRegistro() hace POST con la imagen en el body', () => {
    const datos: Imagen = {
      idInstalacion: 10,
      nombre: 'foto.png',
      descripcion: 'Fachada',
      visible: true,
      contenido: 'base64contenido'
    };

    service.addRegistro(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(7).subscribe();

    const req = httpMock.expectOne(`${api}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: true, success: true, fieldErrors: null });
  });
});
