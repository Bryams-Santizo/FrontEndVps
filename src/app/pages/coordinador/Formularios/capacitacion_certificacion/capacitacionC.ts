import { Component, OnInit } from '@angular/core'; // 1. Importamos OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 2. Importamos las interfaces nuevas (asegúrate que estén en tu servicio)
import { CapacitacionService, ICapacitacion, IInscripcion, IDatosAceptacion } from '../../../../services/capacitacion.service';

@Component({
  selector: 'app-capacitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './capacitacionC.html',
  styleUrls: ['./capacitacionC.css']
})
export class CapacitacionesComponent implements OnInit {
  
  // --- MODELO PARA CREAR CURSOS (LO QUE YA TENÍAS) ---
  capacitacion: ICapacitacion = this.resetModelo();
  mostrarCampoOtroTipo: boolean = false;
  tiposCapacitacion: string[] = ['Módulo de autoaprendizaje', 'Curso virtual', 'Taller presencial', 'Certificación técnica', 'Otro'];

  // --- NUEVO: VARIABLES PARA GESTIONAR INSCRIPCIONES ---
  listaSolicitudes: IInscripcion[] = [];
  mostrarModalAceptacion: boolean = false;
  solicitudSeleccionada: IInscripcion | null = null;
  procesando: boolean = false; // Para evitar doble click



  datosAceptacion: IDatosAceptacion = {
    fechaInicio: '',
    hora: '',
    lugar: '',
    mensajeAdicional: ''
  };

  listaCapacitaciones: ICapacitacion[] = [];
editando: boolean = false;

  constructor(private service: CapacitacionService) {}

  // 3. Al iniciar el componente, cargamos las solicitudes
  ngOnInit(): void {
    this.cargarSolicitudes();
    this.cargarCapacitaciones();
  }

  // --- LÓGICA DE CREACIÓN DE CURSOS (LO QUE YA TENÍAS) ---
  onTipoChange(): void {
    this.mostrarCampoOtroTipo = (this.capacitacion.tipo === 'Otro');
  }

  guardarDatos(): void {
  if (this.capacitacion.tipo === 'Otro' && this.capacitacion.tipoOtro) {
    this.capacitacion.tipo = this.capacitacion.tipoOtro;
  }

  if (this.editando && this.capacitacion.id) {
    this.service.actualizarCapacitacion(this.capacitacion.id, this.capacitacion).subscribe({
      next: () => {
        alert('Curso actualizado');
        this.finalizarOperacion();
      }
    });
  } else {
    this.service.guardarCapacitacion(this.capacitacion).subscribe({
      next: () => {
        alert('Curso registrado');
        this.finalizarOperacion();
      }
    });
  }
}


  resetModelo(): ICapacitacion {
    return { nombre: '', tipo: '', tipoOtro: '', duracion: '', requisitos: '', competencias: '', publicoObjetivo: '', contenido: '', materiales: '', emisor: '', criteriosevaluacion: '', disponibilidad: '', costo: '', instructores: '', disponibilidadL:'', activo:true };
  }


  // --- NUEVO: LÓGICA DE INSCRIPCIONES Y CORREO ADICAM ---

  cargarSolicitudes() {
    this.service.obtenerPendientes().subscribe({
      next: (data) => {
        this.listaSolicitudes = data;
      },
      error: (e) => console.error('Error cargando solicitudes:', e)
    });
  }

  // Abrir el modal para llenar los datos del correo
  abrirModalAceptar(sol: IInscripcion) {
    this.solicitudSeleccionada = sol;
    this.mostrarModalAceptacion = true;
    
    // Texto sugerido por defecto
    this.datosAceptacion.mensajeAdicional = 'Favor de presentarse 10 minutos antes.';
  }

  cerrarModal() {
    this.mostrarModalAceptacion = false;
    this.solicitudSeleccionada = null;
    this.datosAceptacion = { fechaInicio: '', hora: '', lugar: '', mensajeAdicional: '' };
  }

  confirmarAceptacion() {
    if (!this.solicitudSeleccionada?.id) return;

    this.procesando = true;

    // Enviamos los datos al backend, que enviará el correo a nombre de ADICAM
    this.service.aceptarInscripcion(this.solicitudSeleccionada.id, this.datosAceptacion).subscribe({
      next: () => {
        alert(`Inscripción aceptada. Se ha enviado el correo oficial de ADICAM al alumno.`);
        this.procesando = false;
        this.cerrarModal();
        this.cargarSolicitudes(); // Recargamos la tabla para quitar al aceptado
      },
      error: (err) => {
        this.procesando = false;
        console.error(err);
        alert('Error al procesar. Verifica la conexión.');
      }
    });
  }


  //Capacitacion metodos//
  cargarCapacitaciones() {
  this.service.getCapacitaciones().subscribe(data => this.listaCapacitaciones = data);
}
prepararEdicion(curso: ICapacitacion) {
  this.editando = true;
  this.capacitacion = { ...curso }; // Copia para no modificar la tabla directamente
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube al formulario
}

cancelarEdicion() {
  this.editando = false;
  this.capacitacion = this.resetModelo();
}

// Modificamos el guardarDatos para que soporte edición

eliminarCurso(id?: number) {
  if (!id) return;
  if (confirm('¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.')) {
    this.service.eliminarCapacitacion(id).subscribe(() => {
      this.cargarCapacitaciones();
    });
  }
}

private finalizarOperacion() {
  this.editando = false;
  this.capacitacion = this.resetModelo();
  this.cargarCapacitaciones();
}

}
