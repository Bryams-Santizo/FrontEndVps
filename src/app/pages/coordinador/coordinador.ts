import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coordinador',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './coordinador.html',
  styleUrls: ['./coordinador.css']
})
export class CoordinadorComponent {
  cerrarSesion() {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
}
