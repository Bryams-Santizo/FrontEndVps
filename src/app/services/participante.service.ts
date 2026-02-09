// src/app/services/participante.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../config/api-base';

@Injectable({ providedIn: 'root' })
export class ParticipanteService {

  private baseUrl = `${API_BASE}/participantes`; // /api/participantes

  constructor(private http: HttpClient) {}

  getParticipantes(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getActividadCompleta(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/actividad-completa/${id}`).pipe(
      map(data => ({
        ...data,

        proyectos: (data.proyectos || []).map((p: any) => {
          let imgUrl = p.imagenUrl;
          let docUrl = p.documentoUrl;

          // Puede venir en medias o avances
          const listaArchivos = p.medias || p.avances || [];

          if (listaArchivos.length > 0) {
            // Imagen (por fileType)
            const archivoImagen = listaArchivos.find((m: any) => m.fileType?.includes('image'));
            if (archivoImagen?.id) {
              imgUrl = `${API_BASE}/media/download/${archivoImagen.id}`;
            }

            // PDF
            const archivoDoc = listaArchivos.find((m: any) =>
              m.fileType?.includes('pdf') || m.url?.endsWith('.pdf')
            );

            if (archivoDoc) {
              // Si el backend usa download por ID, usamos /api/media/download/:id
              if (archivoDoc.id) {
                docUrl = `${API_BASE}/media/download/${archivoDoc.id}`;
              } else if (archivoDoc.url) {
                // Si ya viene URL absoluta (ej. S3), la respetamos
                docUrl = archivoDoc.url;
              }
            }
          }

          // ✅ IMPORTANTÍSIMO:
          // Ya NO pegamos serverBase con :8080.
          // Si viene absoluta (http), se queda. Si es relativa, la dejamos relativa.
          const normaliza = (u: string | null) => {
            if (!u) return null;
            if (u.startsWith('http')) return u;
            return u.startsWith('/') ? u : `/${u}`;
          };

          return {
            ...p,
            imagenUrl: normaliza(imgUrl),
            documentoUrl: normaliza(docUrl)
          };
        }),

        // Eventos: igual, todo relativo a dominio
        eventos: (data.eventos || []).map((e: any) => ({
          ...e,
          rutaImagen: e.rutaImagen ? `/uploads/${e.rutaImagen}` : null,
          rutaEvidencia: e.rutaEvidencia ? `/uploads/${e.rutaEvidencia}` : null
        }))
      }))
    );
  }
}