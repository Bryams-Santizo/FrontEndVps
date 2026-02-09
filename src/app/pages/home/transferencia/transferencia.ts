import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TransferenciaService } from '../../../services/transferencia.service'; // Ajusta la ruta
import { API_BASE } from '../../../config/api-base';

@Component({
  selector: 'app-registro',
  templateUrl: './transferencia.html',
  styleUrls: ['./transferencia.css'],
  standalone: true,
  imports: [CommonModule],
})
export class TransferenciaComponent implements OnInit {

  listaDatos: any[] = [];
  // URL base para descargar los archivos desde tu backend
  // Derivada según entorno (navegador vs servidor)
  readonly URL_ARCHIVOS: string;

  constructor(private transferenciaService: TransferenciaService, @Inject(PLATFORM_ID) private platformId: Object) {
    const origin = isPlatformBrowser(this.platformId) ? window.location.origin : API_BASE.replace('/api', '');
    this.URL_ARCHIVOS = `${origin}/uploads/`;
  }

  ngOnInit(): void {
    this.obtenerDatosReales();
  }

  obtenerDatosReales(): void {
    this.transferenciaService.listarTodos().subscribe({
      next: (data) => {
        this.listaDatos = data;
      },
      error: (err) => {
        console.error('Error al cargar el impulso tecnológico cafetalero:', err);
      }
    });
  }

  descargarArchivo(nombreArchivo: string): void {
    if (nombreArchivo) {
      window.open(`${this.URL_ARCHIVOS}${nombreArchivo}`, '_blank');
    } else {
      alert('Este archivo no está disponible.');
    }
  }
}