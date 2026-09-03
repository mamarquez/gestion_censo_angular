import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FicheroService } from './fichero.service';
import { Fichero } from '../models/fichero';
import { AUTH } from '../auth/auth.constants';

describe('FicheroService', () => {
  let service: FicheroService;
  let httpMock: HttpTestingController;
  const api = `${AUTH.API}/instalacionesficheros`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(FicheroService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() hace GET a la URL base de ficheros', () => {
    service.getAll({ idInstalacion: '1' }).subscribe();

    const req = httpMock.expectOne(request => request.url === api && request.method === 'GET');
    expect(req.request.params.get('idInstalacion')).toBe('1');
    req.flush({ message: '', data: [], success: true });
  });

  it('descargar() hace GET a /ficheros/{nombre} pidiendo un blob', () => {
    service.descargar('informe.pdf').subscribe();

    const req = httpMock.expectOne(`${api}/ficheros/informe.pdf`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob());
  });

  it('addRegistro() hace POST con el fichero en el body', () => {
    const datos: Fichero = {
      idInstalacion: 1,
      nombre: 'informe.pdf',
      descripcion: 'Un informe',
      contenido: 'data:application/pdf;base64,AAAA',
      visible: true
    };

    service.addRegistro(datos).subscribe();

    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
    req.flush({ message: '', data: true, success: true });
  });

  it('cambiarEstado() hace PATCH a /{id}', () => {
    service.cambiarEstado(5).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ message: '', data: true, success: true });
  });

  it('borrarRegistro() hace DELETE a /{id}', () => {
    service.borrarRegistro(5).subscribe();

    const req = httpMock.expectOne(`${api}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: '', data: true, success: true });
  });
});
