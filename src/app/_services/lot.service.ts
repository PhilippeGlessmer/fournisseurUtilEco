import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Lot } from '../_models/lot';

@Injectable({ providedIn: 'root' })
export class LotService {
  constructor(private http: HttpClient) { }

  getLots(id: number) {
    return this.http.get<Lot[]>(`${environment.apiUrl}/api/fournisseurs/${id}/lots`);
  }
}
