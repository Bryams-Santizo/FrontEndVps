// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE } from '../config/api-base';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // Detecta el host desde donde se sirve Angular
  // - Si corre en el navegador: usa window.location.hostname (puede ser localhost o 192.168.x.x)
  // - Si corre en SSR: usa 'localhost' por defecto
  private readonly host =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // Aquí armamos la URL base del backend
  private apiUrl = `${API_BASE}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: { correo: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        // En SSR no hay localStorage
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          return;
        }

        if (res.token) {
          localStorage.setItem('jwt', res.token);
        }
        if (res.rol) {
          localStorage.setItem('rol', res.rol); // 'ADMIN' o 'COORDINADOR'
        }
        if (res.nombre) {
          localStorage.setItem('nombre', res.nombre);
        }
      })
    );
  }

  logout(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem('jwt');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
  }

  getToken(): string | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem('jwt');
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    return !!localStorage.getItem('jwt');
  }

  getRol(): string | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem('rol');
  }
}