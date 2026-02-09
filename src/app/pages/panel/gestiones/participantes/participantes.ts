import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParticipanteService } from '../../../../services/participante.service';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participantes.html',
  styleUrls: ['./participantes.css']
})
export class ParticipantesComponent implements OnInit {
  // Inyecciones
  private participanteService = inject(ParticipanteService);
  private router = inject(Router);

  // Variables de estado
  participantes: any[] = [];
  roles: any[] = []; // Para almacenar los roles de la BD
  editMode: boolean = false;
  idEnEdicion: number | null = null;

  // Modelo del formulario con rolId para selección dinámica
  nuevoParticipante = {
    nombre: '',
    tipo: 'TECNOLOGICO',
    correo: '',
    telefono: '',
    password: '',
    estado: 'Chiapas',
    ciudad: '',
    rolId: null // Se llenará mediante el select
  };

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarRoles();
  }

  cargarDatos(): void {
    this.participanteService.getParticipantes().subscribe({
      next: (data) => {
        this.participantes = data;
        console.log('Lista de participantes actualizada');
      },
      error: (err) => console.error('Error al cargar datos:', err)
    });
  }

  cargarRoles(): void {
    // Necesitas tener este método en tu service para traer la tabla de roles
    this.participanteService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        console.log('Roles cargados:', data);
      },
      error: (err) => console.error('Error al cargar roles:', err)
    });
  }

  guardarParticipante(): void {
    if (this.editMode) {
      this.actualizarExistente();
    } else {
      this.registrarNuevo();
    }
  }

private registrarNuevo(): void {
  // 1. Validación de seguridad
  if (!this.nuevoParticipante.rolId) {
    alert('Por favor, selecciona un Rol válido de la lista');
    return;
  }

  const payload = {
    nombre: this.nuevoParticipante.nombre,
    tipo: this.nuevoParticipante.tipo,   // Ejemplo: "TECNOLOGICO"
    correo: this.nuevoParticipante.correo,
    telefono: this.nuevoParticipante.telefono,
    estado: this.nuevoParticipante.estado,
    ciudad: this.nuevoParticipante.ciudad,
    password: this.nuevoParticipante.password,
    
    // IMPORTANTE: Asegúrate de que esto sea el ID numérico del ROL (1, 2, 3...)
    // No el nombre del tipo de participante.
    rolId: Number(this.nuevoParticipante.rolId) 
  };

  console.log('Enviando al backend:', payload);

  this.participanteService.registrarParticipanteCompleto(payload).subscribe({
    next: (res) => {
      alert('¡Registrado con éxito!');
      this.resetFormulario();
      this.cargarDatos();
    },
    error: (err) => {
      console.error('Error del servidor:', err);
      // Aquí es donde te sale "Rol no encontrado"
      alert('Error: ' + (err.error || 'Fallo en el servidor'));
    }
  });
}

  private actualizarExistente(): void {
  if (!this.idEnEdicion) return;

  const payload = {
    ...this.nuevoParticipante,
    rolId: Number(this.nuevoParticipante.rolId)
  };

  this.participanteService.actualizarParticipante(this.idEnEdicion, payload).subscribe({
    next: () => {
      alert('¡Actualizado con éxito!');
      this.cancelarEdicion();
      this.cargarDatos();
    },
    error: (err) => alert('Error al actualizar: ' + (err.error || 'Fallo'))
  });
}

  prepararEdicion(p: any): void {
    this.editMode = true;
    this.idEnEdicion = p.id;
    
    // Al editar, mapeamos los campos intentando entrar en los objetos anidados
    this.nuevoParticipante = {
      nombre: p.tecnologico?.nombre || p.empresa?.nombre || p.nombre || '',
      tipo: p.tipo,
      correo: p.tecnologico?.correo || p.empresa?.correo || p.correo || '',
      telefono: p.tecnologico?.telefono || p.telefono || '',
      password: '', 
      estado: p.tecnologico?.estado || p.estado || 'Chiapas',
      ciudad: p.tecnologico?.ciudad || p.ciudad || '',
      rolId: p.usuario?.rol?.id || null
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.editMode = false;
    this.idEnEdicion = null;
    this.resetFormulario();
  }

  eliminarParticipante(id: number): void {
  if (confirm('¿Estás seguro de eliminar este registro?')) {
    this.participanteService.eliminarParticipante(id).subscribe({
      next: () => {
        alert('Eliminado correctamente');
        this.cargarDatos(); // Recargar la lista
      },
      error: (err) => console.error('Error al eliminar:', err)
    });
  }
}

  resetFormulario(): void {
    this.nuevoParticipante = {
      nombre: '',
      tipo: 'TECNOLOGICO',
      correo: '',
      telefono: '',
      password: '',
      estado: 'Chiapas',
      ciudad: '',
      rolId: null
    };
  }

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

  verActividad(id: number): void {
    this.router.navigate(['/actividad-detalle', id]);
  }
}