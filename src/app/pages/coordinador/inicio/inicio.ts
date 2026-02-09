import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProyectoService } from '../../../services/proyecto.service'; // Ajusta la ruta si es necesario
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule], // Añadimos RouterModule para los botones
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit {
  coordinador = 'Coordinador';
  proyectos = 0;
  avances = 0;
  reportes = 0;

  constructor(
    private proyectoService: ProyectoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Recuperar nombre del localStorage de forma segura
      const nombreGuardado = localStorage.getItem('nombre');
      if (nombreGuardado) this.coordinador = nombreGuardado;

      this.cargarEstadisticas();
    }
  }

  cargarEstadisticas(): void {
    // 1. Obtener total de proyectos
    this.proyectoService.listarProyectos().subscribe({
      next: (lista) => {
        this.proyectos = lista.length;
        
        // 2. Lógica para contar avances y reportes
        // Si no tienes endpoints específicos, podemos contar documentos por tipo
        // Aquí un ejemplo de cómo podrías calcularlo si tuvieras acceso a todos los docs:
        this.calcularConteosDocumentos(lista);
      },
      error: (err) => console.error('Error al cargar estadísticas:', err)
    });
  }

  private calcularConteosDocumentos(proyectos: any[]): void {
    // Esta es una solución temporal. Lo ideal sería tener un endpoint 
    // en el backend que devuelva estas métricas (/api/dashboard/stats)
    let totalAvances = 0;
    
    proyectos.forEach(p => {
      this.proyectoService.listarDocumentos(p.id).subscribe(docs => {
        // Ejemplo: Filtramos por nombre o tipo si tu lógica lo permite
        this.avances += docs.filter(d => d.fileName?.toLowerCase().includes('avance')).length;
        this.reportes += docs.filter(d => d.fileName?.toLowerCase().includes('reporte')).length;
      });
    });
  }
}