import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CapacitacionService, ICapacitacion } from '../../../services/capacitacion.service';

@Component({
  selector: 'app-capacitacion-publica',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './capacitacion.html',
  styleUrls: ['./capacitacion.css']
})
export class CapacitacionComponent implements OnInit {
  private service = inject(CapacitacionService);
  private cdr = inject(ChangeDetectorRef);

  listaCapacitaciones: ICapacitacion[] = [];
  cursosFiltrados: ICapacitacion[] = [];
  
  terminoBusqueda: string = '';
  cursoSeleccionado: ICapacitacion | null = null;
  
  mostrarFormularioInscripcion: boolean = false;
  datosAlumno = { nombre: '', email: '', telefono: '' };


  constructor(private CapacitacionService: CapacitacionService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.CapacitacionService.getCapacitaciones().subscribe({
      next: (data) => {
        this.listaCapacitaciones = data;
        this.cursosFiltrados = data;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Error al cargar cursos:', e)
    });
  }

  filtrarCursos(): void {
    const busqueda = this.terminoBusqueda.toLowerCase().trim();
    this.cursosFiltrados = !busqueda 
      ? this.listaCapacitaciones 
      : this.listaCapacitaciones.filter(curso => 
          curso.nombre.toLowerCase().includes(busqueda) || 
          curso.competencias.toLowerCase().includes(busqueda)
        );
  }

  abrirModal(curso: ICapacitacion): void {
    this.cursoSeleccionado = curso;
    this.mostrarFormularioInscripcion = false; // Asegurar que el otro modal esté cerrado
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.cursoSeleccionado = null;
    document.body.style.overflow = 'auto';
  }

abrirInscripcion(curso: ICapacitacion) {
  this.cursoSeleccionado = curso;
  this.mostrarFormularioInscripcion = true;
  document.body.style.overflow = 'hidden';
  
  // Agregamos esto para forzar que el HTML reaccione
  this.cdr.detectChanges(); 
}

  cerrarFormulario() {
    this.mostrarFormularioInscripcion = false;
    this.cursoSeleccionado = null;
    this.datosAlumno = { nombre: '', email: '', telefono: '' };
    document.body.style.overflow = 'auto';
  }

enviarInscripcion() {
  if (!this.datosAlumno.nombre || !this.datosAlumno.email) return;

  const solicitud = {
    nombreAlumno: this.datosAlumno.nombre,
    emailAlumno: this.datosAlumno.email,
    telefonoAlumno: this.datosAlumno.telefono,
    capacitacion: { id: this.cursoSeleccionado?.id } 
  };

  this.CapacitacionService.solicitarInscripcion(solicitud).subscribe({
    next: () => {
      alert('¡Solicitud enviada a ADICAM! Espera tu confirmación por correo.');
      this.cerrarFormulario();
    },
    error: (e) => {
      console.error(e);
      alert('Error al enviar la solicitud.');
    }
  });
}
}
