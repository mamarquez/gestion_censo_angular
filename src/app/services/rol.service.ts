import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Rol } from '../models/rol';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class RolService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/roles`;


   /**
   * Obtener provincias
   */
  getAll(): Observable<ApiResponse<Rol[]>> {
    return this.http.get<ApiResponse<Rol[]>>(this.api);
  }
}
