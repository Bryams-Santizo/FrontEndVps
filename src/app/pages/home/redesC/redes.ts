import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColaboracionService } from '../../../services/colaboracion.service'; // Ajusta la ruta

@Component({
  selector: 'app-consulta-colaboraciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './redes.html',
  styleUrls: ['./redes.css']
})
export class RedesComponent implements OnInit {

  listaColaboraciones: any[] = [];

  constructor(private colaboracionService: ColaboracionService) { }

  ngOnInit(): void {
    this.obtenerColaboraciones();
  }

  obtenerColaboraciones(): void {
    this.colaboracionService.getColaboraciones().subscribe({
      next: (data) => {
        this.listaColaboraciones = data;
      },
      error: (err) => {
        console.error('Error al obtener colaboraciones', err);
      }
    });
  }

  // Función para descargar archivos reales usando la URL mapeada en el servicio
  descargarArchivo(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('El archivo no está disponible.');
    }
  }
}
