import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importamos Router para la navegación
import { ParticipanteService } from '../../../services/participante.service';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participantes.component.html',
  styleUrls: ['./participantes.component.css']
})
export class ParticipantesComponent implements OnInit {
  // Inyecciones
  private participanteService = inject(ParticipanteService);
  private router = inject(Router); 
  
  participantes: any[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.participanteService.getParticipantes().subscribe({
      next: (data) => {
        this.participantes = data;
        console.log('Datos cargados:', data);
      },
      error: (err) => console.error('Error al conectar:', err)
    });
  }

  // 🚩 FUNCIÓN QUE FALTABA: Quita el error del HTML
  verActividad(id: number) {
  if (id) {
    // Esto navegará a /actividad-detalle/5 (por ejemplo)
    this.router.navigate(['/actividad-detalle', id]);
  } else {
    console.warn('El participante no tiene un ID válido');
  }
}
  // Función para asignar colores según el tipo (Tecnológico, Empresa, etc.)
  getBadgeClass(tipo: string): string {
    if (!tipo) return 'bg-secondary';
    
    switch (tipo.toUpperCase()) {
      case 'TECNOLOGICO': return 'bg-info text-dark';
      case 'EMPRESA': return 'bg-success text-white';
      case 'GOBIERNO': return 'bg-warning text-dark';
      case 'ORGANIZACION': return 'bg-primary text-white';
      default: return 'bg-secondary text-white';
    }
  }
}