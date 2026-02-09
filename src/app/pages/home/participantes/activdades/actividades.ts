import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core'; // 🚩 Agregado PLATFORM_ID
import { ActivatedRoute, Router } from '@angular/router';
import { ParticipanteService } from '../../../../services/participante.service';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // 🚩 Importado desde common
import { API_BASE } from '../../../../config/api-base';

@Component({
  selector: 'app-participante-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actividades.html',
  styleUrls: ['./actividades.css']
})
export class ParticipanteDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ParticipanteService);
  private platformId = inject(PLATFORM_ID); 

  actividad: any = { proyectos: [], eventos: [], cursos: [] };
  nombre: string = '';
  
  // Base del servidor o origen para recursos; se calcula en tiempo de ejecución
  serverBase: string = '';

  ngOnInit() {
    // Validamos si estamos en el navegador antes de usar 'window'
    if (isPlatformBrowser(this.platformId)) {
      this.serverBase = window.location.origin;
    } else {
      this.serverBase = API_BASE.replace('/api', '');
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getActividadCompleta(+id).subscribe({
  next: (data: any) => {
    this.actividad = data;
    // CORRECCIÓN AQUÍ:
    this.nombre = data.tecnologico?.nombre || data.nombre || 'Sin nombre';
    console.log('Actividad recibida:', data);
  },
  error: (err: any) => console.error('Error:', err)
});
    }
  }

 obtenerUrlImagen(url: string | null | undefined): string {
  // Asegúrate de que la carpeta se llame 'Imegenes' (con e) como pusiste en el código
  const defaultImg = 'assets/Imegenes/default_project.png'; 
  
  if (!url || url === 'null' || url.includes('null')) return defaultImg;
  return url;
}


  regresar() {
    this.router.navigate(['/participantes']);
  }

  // 🚩 Método para abrir documentos de forma segura
  verDocumento(url: string) {
    if (isPlatformBrowser(this.platformId)) {
      window.open(url, '_blank');
    }
  }
}