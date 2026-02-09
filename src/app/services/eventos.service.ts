import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../config/api-base';

// 1. INTERFAZ PARA VISUALIZACIÓN
export interface IEventoVisualizacion {
  id_evento: number;
  nombre: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  organizador: string;
  objetivo: string;
  publicoObjetivo: string;
  programa: string;
  ponentes: string;
  requisitos: string;
  materiales: string;
  rutaEvidencia: string | null;

  rutaImagen: string | null;
  enlaceExterno: string | null;
}

@Injectable({ providedIn: 'root' })
export class EventoService {

  private apiUrl = API_BASE;
  private eventosUrl = `${this.apiUrl}/eventos`; // /api/eventos

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<IEventoVisualizacion[]> {
    const token =
      (typeof window !== 'undefined' && typeof localStorage !== 'undefined')
        ? localStorage.getItem('jwt_token')
        : null;

    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http.get<IEventoVisualizacion[]>(this.eventosUrl, { headers });
  }

  crearEvento(formData: FormData): Observable<IEventoVisualizacion> {
    return this.http.post<IEventoVisualizacion>(this.eventosUrl, formData);
  }

  eliminarEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.eventosUrl}/${id}`);
  }

  actualizarEventoFormData(id: number, formData: FormData): Observable<IEventoVisualizacion> {
    return this.http.put<IEventoVisualizacion>(`${this.eventosUrl}/${id}`, formData);
  }

  actualizarEventoJson(id: number, evento: Partial<IEventoVisualizacion>): Observable<IEventoVisualizacion> {
    return this.http.put<IEventoVisualizacion>(`${this.eventosUrl}/${id}`, evento);
  }

  listarUltimosTres(): Observable<IEventoVisualizacion[]> {
    return this.http.get<IEventoVisualizacion[]>(`${this.eventosUrl}/latest`);
  }

  listarEventosPublicos(): Observable<IEventoVisualizacion[]> {
    const publicUrl = `${this.apiUrl}/public/eventos`;

    return this.http.get<IEventoVisualizacion[]>(publicUrl).pipe(
      map(eventos =>
        eventos.map(e => ({
          ...e,
          // ✅ En producción: https://adicam.cloud/uploads/xxxx
          rutaImagen: e.rutaImagen ? `/uploads/${e.rutaImagen}` : null,
          rutaEvidencia: e.rutaEvidencia ? `/uploads/${e.rutaEvidencia}` : null,
        }))
      )
    );
  }
}