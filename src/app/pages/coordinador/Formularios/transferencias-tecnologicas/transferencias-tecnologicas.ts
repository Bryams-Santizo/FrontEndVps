import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransferenciaService } from '../../../../services/transferencia.service'; // Asegura la ruta correcta

export interface ITransferenciaTecnologica {
  id?: number; // Opcional para nuevos registros
  nombreTecnologia: string;
  tipo: string;
  especificacionOtroTipo?: string;
  descripcion: string;
  capacidades: string;
  servicios: string;
  requisitos: string;
  disponibilidad: string;
  costos: string;
  responsable: string;
  documentos: File | null;
  carta: File | null;
}

@Component({
  selector: 'app-transferencias-tecnologicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transferencias-tecnologicas.html',
  styleUrls: ['./transferencias-tecnologicas.css']
})
export class TransferenciasTecnologicasComponent implements OnInit {

  // Objeto principal del formulario
  datos: ITransferenciaTecnologica = this.inicializarDatos();
  
  // Lista para la tabla
  listaTransferencias: any[] = [];
  
  // Control de estado
  editandoId: number | null = null;

  tiposTecnologia: string[] = [
    'Laboratorio', 'Prototipo', 'Equipo', 'Software', 'Método / proceso', 'Otro'
  ];

  constructor(private transferenciaService: TransferenciaService) {}

  ngOnInit(): void {
    this.cargarRegistros();
  }

  // --- MÉTODOS DE CARGA ---

  cargarRegistros(): void {
    this.transferenciaService.listarTodos().subscribe({
      next: (res) => this.listaTransferencias = res,
      error: (err) => console.error('Error al cargar datos', err)
    });
  }

  inicializarDatos(): ITransferenciaTecnologica {
    return {
      nombreTecnologia: '',
      tipo: '',
      especificacionOtroTipo: '',
      descripcion: '',
      capacidades: '',
      servicios: '',
      requisitos: '',
      disponibilidad: '',
      costos: '',
      responsable: '',
      documentos: null,
      carta: null
    };
  }

  // --- GESTIÓN DE FORMULARIO ---

  get mostrarOtroTipo(): boolean {
    return this.datos.tipo === 'Otro';
  }

  seleccionarArchivo(event: Event, tipo: 'documentos' | 'carta'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      if (tipo === 'documentos') this.datos.documentos = archivo;
      else this.datos.carta = archivo;
    }
  }

  guardarTransferencias(): void {
    // 1. Validaciones
    if (this.mostrarOtroTipo && !this.datos.especificacionOtroTipo?.trim()) {
      alert('Por favor, especifique el tipo de tecnología.');
      return;
    }

    // 2. Preparar FormData para el Backend
    const formData = new FormData();
    
    // Consolidar el tipo (si es "Otro", usar la especificación)
    const tipoFinal = this.mostrarOtroTipo ? this.datos.especificacionOtroTipo : this.datos.tipo;

    // Crear el objeto JSON que espera el Backend (sin los Files)
    const datosJson = {
      ...this.datos,
      id: this.editandoId, // Incluir ID si estamos editando
      tipo: tipoFinal
    };

    // Agregar el JSON como string y los archivos
    formData.append('datos', JSON.stringify(datosJson));
    if (this.datos.documentos) formData.append('documentos', this.datos.documentos);
    if (this.datos.carta) formData.append('carta', this.datos.carta);

    // 3. Enviar al Servicio
    this.transferenciaService.guardar(formData, this.editandoId || undefined).subscribe({
      next: () => {
        alert(this.editandoId ? 'Registro actualizado' : 'Registro creado con éxito');
        this.limpiarFormulario();
        this.cargarRegistros();
      },
      error: (err) => alert('Error al procesar: ' + err.message)
    });
  }

  // --- ACCIONES DE LA TABLA ---

  prepararEdicion(item: any): void {
    this.editandoId = item.id;
    
    // Clonar el item para el formulario
    this.datos = { ...item };
    
    // Lógica para manejar el select de "Tipo" si es un valor personalizado
    if (!this.tiposTecnologia.includes(item.tipo)) {
      this.datos.tipo = 'Otro';
      this.datos.especificacionOtroTipo = item.tipo;
    }

    // Nota: Los inputs de tipo 'file' no se pueden rellenar por seguridad del navegador
    this.datos.documentos = null;
    this.datos.carta = null;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarRegistro(id: number): void {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      this.transferenciaService.eliminar(id).subscribe({
        next: () => {
          this.cargarRegistros();
          alert('Registro eliminado');
        },
        error: (err) => console.error(err)
      });
    }
  }

  limpiarFormulario(): void {
    this.datos = this.inicializarDatos();
    this.editandoId = null;
    // Resetear inputs de archivos manualmente si es necesario
  }
}