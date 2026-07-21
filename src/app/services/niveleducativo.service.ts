import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { NivelEducativo } from '../models/niveleducativo';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class NivelEducativoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/niveleseducativos`;


   /**
   * Obtener todos los niveles educativos
   */
  getAll(): Observable<ApiResponse<NivelEducativo[]>> {
    return this.http.get<ApiResponse<NivelEducativo[]>>(this.api);
  }
}
