import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core'; //  Agregado PLATFORM_ID
import { ActivatedRoute, Router } from '@angular/router';
import { ParticipanteService } from '../../../../services/participante.service';
import { CommonModule, isPlatformBrowser } from '@angular/common'; //  Importado desde common
import { GaleriaService } from '../../../../services/galeria.service';


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
  private galeriaService = inject(GaleriaService);
evidencias: any[] = [];


  actividad: any = { proyectos: [], eventos: [], cursos: [] };
  nombre: string = '';
  
  // Quitamos la inicialización con 'window' de aquí arriba
  serverBase: string = 'http://localhost:8080'; 

 ngOnInit() {
  if (isPlatformBrowser(this.platformId)) {
    this.serverBase = `http://${window.location.hostname}:8080`;
  }

  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    // 1. Obtenemos los datos del participante (eventos y proyectos)
    this.service.getActividadCompleta(+id).subscribe({
      next: (data: any) => {
        this.actividad = data;
        this.nombre = data.nombre || 'Sin nombre';
        console.log('Datos del participante:', data);

        // 2. BUSQUEDA DEL ID DEL TECNOLÓGICO
        // Lo buscamos en la raíz, o en el primer proyecto, o en el primer evento
        let idTecParaGaleria = data.tecnologico?.id;

        if (!idTecParaGaleria) {
          if (data.proyectos && data.proyectos.length > 0) {
            idTecParaGaleria = data.proyectos[0].tecnologico?.id;
          } else if (data.eventos && data.eventos.length > 0) {
            idTecParaGaleria = data.eventos[0].tecnologico?.id;
          }
        }

        // 3. Si encontramos el ID (debería ser 26 para Mayki), buscamos las fotos
        if (idTecParaGaleria) {
          console.log('ID Tecnológico detectado:', idTecParaGaleria);
          this.consultarGaleria(idTecParaGaleria);
        } else {
          console.warn(' No se encontró ID de tecnológico para este participante.');
          this.evidencias = [];
        }
      },
      error: (err: any) => console.error('Error al traer actividad:', err)
    });
  }
}

// Función auxiliar para no amontonar código en el ngOnInit
consultarGaleria(idTec: number) {
  this.galeriaService.listarPorTecnologico(idTec).subscribe({
    next: (ev: any[]) => {
      console.log('Evidencias recibidas:', ev);
      this.evidencias = ev || [];
    },
    error: (err) => console.error('Error al cargar galería:', err)
  });
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
