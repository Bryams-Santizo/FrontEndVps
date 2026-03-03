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
  documentosAdjuntos?: string;
  cartaIntencion?: string;
  estado: string;
  // Campos mapeados para la visualización en el frontend
  documentoUrl?: string;
  cartaUrl?: string;
}

/* ============================
    SERVICE
============================ */

@Injectable({
  providedIn: 'root'
})
export class ColaboracionService {

  // 🔥 URL centralizada desde la configuración de producción
  private apiColaboraciones = `${API_BASE}/colaboraciones`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las colaboraciones y mapea los nombres de archivo 
   * a URLs completas para que el navegador pueda acceder a ellos.
   */
  getColaboraciones(): Observable<IColaboracion[]> {
    // Se asume que el servidor de archivos está en la misma base que la API
    // pero en la carpeta /uploads/
    const serverBase = API_BASE.replace('/api', ''); 

    return this.http.get<IColaboracion[]>(this.apiColaboraciones).pipe(
      map(data => {
        return data.map(colab => ({
          ...colab,
          documentoUrl: colab.documentosAdjuntos ? `${serverBase}/uploads/${colab.documentosAdjuntos}` : undefined,
          cartaUrl: colab.cartaIntencion ? `${serverBase}/uploads/${colab.cartaIntencion}` : undefined
        }));
      })
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
   * Actualiza una colaboración permitiendo el envío de nuevos archivos (FormData)
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
