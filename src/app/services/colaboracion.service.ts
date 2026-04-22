import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../config/api-base';

/* ============================
    INTERFACES
============================ */

export interface IColaboracion {
  id?: number;
  institucionSolicitante: string;
  tipoColaboracion: string;
  descripcionNecesidad: string;
  numeroEstudiantes: string;
  perfilCompetencias: string;
  duracion: string;
  beneficios: string;
  personaContacto: string;

  documentosAdjuntos?: string;   // imagen (o archivo) principal
  cartaIntencion?: string;       // pdf u otro
  estado: string;

  // Campos mapeados para la visualización en el frontend
  imagenUrl?: string | null;
  documentoUrl?: string | null;
  cartaUrl?: string | null;      // opcional si luego lo usas
}

/* ============================
    SERVICE
============================ */

@Injectable({
  providedIn: 'root'
})
export class ColaboracionService {

  // 🔥 API centralizada (en navegador: /api/colaboraciones)
  private apiColaboraciones = `${API_BASE}/colaboraciones`;

  // ✅ Base pública para archivos estáticos (según tu nginx: location ^~ /uploads/)
  // Esto funciona en prod y en dev (si también sirves /uploads).
  private uploadsBase = `/uploads`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las colaboraciones y mapea nombres de archivo a URLs públicas (/uploads)
   */
  getColaboraciones(): Observable<IColaboracion[]> {
    return this.http.get<IColaboracion[]>(this.apiColaboraciones).pipe(
      map(data => data.map(colab => ({
        ...colab,

        // ✅ imagen superior de la ficha
        imagenUrl: colab.documentosAdjuntos
          ? `${this.uploadsBase}/${colab.documentosAdjuntos}`
          : null,

        // ✅ pdf/icono descarga
        documentoUrl: colab.cartaIntencion
          ? `${this.uploadsBase}/${colab.cartaIntencion}`
          : null,

        // si luego quieres separar:
        // cartaUrl: colab.cartaIntencion ? `${this.uploadsBase}/${colab.cartaIntencion}` : null,
      })))
    );
  }

  /**
   * Crea una nueva colaboración enviando archivos mediante FormData
   */
  crearColaboracionFormData(formData: FormData): Observable<IColaboracion> {
    return this.http.post<IColaboracion>(this.apiColaboraciones, formData);
  }

  /**
   * Actualiza datos básicos (JSON)
   */
  actualizarColaboracion(id: number, datos: Partial<IColaboracion>): Observable<IColaboracion> {
    return this.http.put<IColaboracion>(`${this.apiColaboraciones}/${id}`, datos);
  }

  /**
   * Actualiza una colaboración permitiendo envío de nuevos archivos (FormData)
   */
  actualizarColaboracionFormData(id: number, formData: FormData): Observable<IColaboracion> {
    return this.http.put<IColaboracion>(`${this.apiColaboraciones}/${id}`, formData);
  }

  /**
   * Elimina una colaboración por ID
   */
  eliminarColaboracion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiColaboraciones}/${id}`);
  }
}
