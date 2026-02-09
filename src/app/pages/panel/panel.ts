import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ProyectoService } from '../../services/proyecto.service';
import { EventoService } from '../../services/eventos.service';// Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './panel.html',
  styleUrls: ['./panel.css']
})
export class PanelComponent implements OnInit {

  usuario: string = '';
  
  // Variables para estadísticas
  totalTecnologicos: number = 0;
  totalProyectos: number = 0;
  totalEventos: number = 0;
  actividadesRecientes: any[] = [];

  constructor(
    public router: Router,
    private proyectoService: ProyectoService,
    private eventoservice: EventoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt');
      const userStr = localStorage.getItem('user');

      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      this.establecerUsuario(userStr);
      this.cargarDashboard();
    }
  }

 private establecerUsuario(userStr: string | null): void {
  // 1. Si no lo encuentra como 'user', intentamos buscar otras llaves comunes
  const data = userStr || localStorage.getItem('usuario') || localStorage.getItem('nombre');

  if (data) {
    try {
      const userObj = JSON.parse(data);
      console.log("Datos recuperados:", userObj);

      // 2. Buscamos el nombre en todas las variantes posibles que suelen venir de la BD
      this.usuario = 
        userObj.nombre || 
        userObj.username || 
        userObj.displayName || 
        (userObj.user && userObj.user.nombre) || 
        'Administrador';

    } catch (e) {
      // 3. Si no es un JSON, el texto tal cual podría ser el nombre (ej. "Admin CoordinacionCafe")
      this.usuario = data.replace(/"/g, ''); 
    }
  } else {
    // 4. Si llegamos aquí, es que no hay NADA en localStorage
    this.usuario = 'Sesión no detectada';
    console.error("No se encontró ninguna sesión activa en LocalStorage");
  }
}

  cargarDashboard(): void {
  // 1. Cargar Proyectos
  this.proyectoService.listarProyectos().subscribe({
    next: (proyectos) => {
      this.totalProyectos = proyectos.length;
      
      // Extraer tecnológicos únicos
      const tecsUnicos = new Set(proyectos.map((p: any) => p.idTecnologico || p.tecnologicoId));
      this.totalTecnologicos = tecsUnicos.size;

      // Actividad reciente (puedes mezclar proyectos aquí)
      this.actividadesRecientes = proyectos.slice(-3).map((p: any) => ({
        tipo: 'Proyecto',
        mensaje: `Registrado: ${p.nombre}`,
        tiempo: 'Reciente'
      }));
    },
    error: (err) => console.error('Error cargando proyectos:', err)
  });

  // 2. Cargar Eventos (Ahora funcional)
  this.eventoservice.listarTodos().subscribe({
    next: (eventos) => {
      this.totalEventos = eventos.length;
      
      // Opcional: Agregar eventos a la actividad reciente
      if (eventos.length > 0) {
        const ultimoEvento = eventos[eventos.length - 1];
        this.actividadesRecientes.unshift({
          tipo: 'Evento',
          mensaje: `Nuevo evento: ${ultimoEvento.nombre}`,
          tiempo: 'Ahora'
        });
      }
    },
    error: (err) => {
      console.error('Error cargando eventos:', err);
      this.totalEventos = 0; // Fallback en caso de error
    }
  });
}

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }
}