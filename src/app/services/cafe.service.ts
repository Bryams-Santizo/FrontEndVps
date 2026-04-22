import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config/api-base';

@Injectable({
  providedIn: 'root'
})
export class CafeService {

  private apiUrl = `${API_BASE}/bolsa/cafe-hoy`;

  constructor(private http: HttpClient) {}

  getPrecioBolsa(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

}
