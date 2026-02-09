import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../config/api-base';

@Injectable({
  providedIn: 'root'
})
export class TransferenciaService {
  // Asegúrate de que esta URL coincida con tu backend
  private apiUrl = `${API_BASE}/transferencias`;

  constructor(private http: HttpClient) {}

  // --- OBTENER TODOS LOS REGISTROS ---
  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // --- GUARDAR O ACTUALIZAR ---
  // Usamos FormData porque enviamos archivos y un JSON String
  guardar(formData: FormData, id?: number): Observable<any> {
    if (id) {
      // Si hay ID, es una actualización (PUT)
      return this.http.put(`${this.apiUrl}/${id}`, formData);
    } else {
      // Si no hay ID, es una creación (POST)
      return this.http.post(this.apiUrl, formData);
    }
  }

  // --- ELIMINAR ---
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- OBTENER UNO SOLO (Opcional) ---
  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}