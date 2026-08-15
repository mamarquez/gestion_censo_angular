import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { InstalacionRutaCoordenada } from '../models/instalacionRutaCoordenada';

@Injectable({
  providedIn: 'root'
})
export class InstalacionRutaCoordenadaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/instalacionesrutascoordenadas`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener coordenadas, opcionalmente filtradas por ruta
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<InstalacionRutaCoordenada[]>> {
    return this.http.get<ApiResponseWrapper<InstalacionRutaCoordenada[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Crea una nueva coordenada para una ruta
   * @param idRuta Id de la ruta
   * @param coordenada Datos de la coordenada (x, y)
   */
  crear(idRuta: number, coordenada: Partial<InstalacionRutaCoordenada>): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, {
      id: null,
      idRuta,
      x: coordenada.x,
      y: coordenada.y
    }, { headers: this.headers });
  }

  /**
   * Actualiza una coordenada existente
   * @param id Id de la coordenada
   * @param idRuta Id de la ruta
   * @param coordenada Datos actualizados (x, y)
   */
  actualizar(id: number, idRuta: number, coordenada: Partial<InstalacionRutaCoordenada>): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, {
      id,
      idRuta,
      x: coordenada.x,
      y: coordenada.y
    }, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
