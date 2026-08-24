import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { InstalacionRuta } from '../models/instalacionRuta';

@Injectable({
  providedIn: 'root'
})
export class InstalacionRutaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/instalacionesrutas`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos los espacios deportivos de instalaciones
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<InstalacionRuta[]>> {
    return this.http.get<ApiResponseWrapper<InstalacionRuta[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener una ruta por su id
   */
  get(id: number): Observable<ApiResponseWrapper<InstalacionRuta>> {
    return this.http.get<ApiResponseWrapper<InstalacionRuta>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Cambia la visibilidad
   * @param id Id del registro
   */
  cambiarVisible(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.patch<ApiResponseWrapper<boolean>>(`${this.api}/visibilidad/${id}`, null, { headers: this.headers });
  }

  /**
   * Crea una nueva ruta
   * @param ruta Datos de la ruta
   */
  crear(ruta: Partial<InstalacionRuta>): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, ruta, { headers: this.headers });
  }

  /**
   * Actualiza una ruta existente
   * @param id Id de la ruta
   * @param idInstalacion Id de la instalación propietaria de la ruta
   * @param ruta Datos actualizados de la ruta (nombre, descripción, visible, activo)
   */
  actualizar(id: number, idInstalacion: number, ruta: { nombre: string; descripcion?: string | null; visible: boolean; activo: boolean }): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { id, idInstalacion, ...ruta }, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }


  /**
   * Descarga un fichero kml de una ruta
   * 
   * @param idRuta Id del ruta
   * @returns fichero kml
   */
  descargarFichero(idRuta: number): Observable<Blob> {
    return this.http.get(`${this.api}/descargar/${idRuta}`, { headers: this.headers, responseType: 'blob' });
  }

}
