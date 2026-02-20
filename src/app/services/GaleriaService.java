import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config/api-base';

@Injectable({
  providedIn: 'root'
})
export class GaleriaService {

  private http = inject(HttpClient);

  // 🔥 URL dinámica producción
  private apiUrl = `${API_BASE}/galeria`;

  /* ============================
     HEADERS CON JWT
  ============================ */

  private getHeaders(): HttpHeaders {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('jwt')   // 🔥 corregido
        : null;

    return new HttpHeaders().set(
      'Authorization',
      token ? `Bearer ${token}` : ''
    );
  }

  /* ============================
     CRUD GALERÍA
  ============================ */

  crearEvidencia(formData: FormData): Observable<any> {
    return this.http.post(
      this.apiUrl,
      formData,
      { headers: this.getHeaders() }
    );
  }

  listar(): Observable<any[]> {
    return this.http.get<any[]>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  listarPorTecnologico(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/tecnologico/${id}`,
      { headers: this.getHeaders() }
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
