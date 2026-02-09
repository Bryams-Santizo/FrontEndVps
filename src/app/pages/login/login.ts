import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  correo: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (!this.correo || !this.password) {
      this.errorMessage = 'Por favor ingresa tus credenciales.';
      return;
    }

    this.authService.login({ correo: this.correo, password: this.password }).subscribe({
      next: (response: any) => {
        // Guardamos el token y datos del usuario (solo en navegador)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('rol', response.rol);
          localStorage.setItem('correo', response.correo);
          localStorage.setItem('nombre', response.nombre);
        }

        // Redirigir según el rol
        if (response.rol === 'ADMIN') {
          this.router.navigate(['/panel']);
        } else if (response.rol === 'COORDINADOR') {
          this.router.navigate(['/coordinador']);
        } else {
          this.errorMessage = 'Rol no autorizado.';
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorMessage = 'Usuario o contraseña incorrectos.';
      }
    });
  }
}