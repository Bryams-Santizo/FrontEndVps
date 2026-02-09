import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();

    //  NO agregar token a rutas públicas
    const isPublic =
      req.url.includes('/api/public/') ||
      req.url.includes('/api/media/view/') ||
      req.url.includes('/api/auth/login') ||
      req.url.includes('/api/estadisticas/');

    if (isPublic) {
      return next.handle(req);
    }

    // ✔ Agregar token solo a lo protegido
    if (token) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
