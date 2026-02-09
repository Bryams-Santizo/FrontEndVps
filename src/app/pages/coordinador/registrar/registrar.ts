import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProyectoService, Proyecto } from '../../../services/proyecto.service';

@Component({
  selector: 'app-registrar-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar.html',
  styleUrls: ['./registrar.css']
})
export class Registrar {

  proyecto: Proyecto = {
    nombre: '',
    descripcion: '',
    actividad: '',
    necesidad: '',
    estadoProyecto: '',
    fechaInicio: '',
    fechaFin: '',
    empresaVinculada: '',
    tecnologico: null
  };

  // archivos
  imagenFile: File | null = null;      // imagen representativa
  documentoFile: File | null = null;   // archivo principal (pdf/word/etc)

  mensajeOk = '';
  mensajeError = '';

  constructor(private proyectoService: ProyectoService) {}

  // cuando el usuario elige la imagen representativa
  onImagenChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.imagenFile = file;

    if (file) {
      console.log('Imagen representativa seleccionada:', file.name);
    }
  }

  // cuando el usuario elige el documento del proyecto
  onDocumentoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.documentoFile = file;

    if (file) {
      console.log('Documento del proyecto seleccionado:', file.name);
    }
  }

  registrarProyecto(form: NgForm): void {
    this.mensajeOk = '';
    this.mensajeError = '';

    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      this.mensajeError = 'Por favor llena todos los campos obligatorios.';
      return;
    }

    // 1️⃣ Primero creamos el proyecto (datos)
    this.proyectoService.crearProyecto(this.proyecto).subscribe({
      next: (proy) => {
        console.log('Proyecto creado:', proy);

        const proyectoId = proy.id!;
        const uploaderId = 1; // TODO: aquí debes poner el id del usuario logueado

        // 2️⃣ Luego subimos archivos vinculados a ESTE proyecto
        // Imagen representativa
        if (this.imagenFile) {
          this.proyectoService.subirDocumento(this.imagenFile, proyectoId, uploaderId).subscribe({
            next: (m) => {
              console.log('Imagen representativa subida:', m);
            },
            error: (err) => console.error('Error subiendo imagen representativa:', err)
          });
        }

        // Documento principal
        if (this.documentoFile) {
          this.proyectoService.subirDocumento(this.documentoFile, proyectoId, uploaderId).subscribe({
            next: (m) => {
              console.log('Documento del proyecto subido:', m);
            },
            error: (err) => console.error('Error subiendo documento del proyecto:', err)
          });
        }

        this.mensajeOk = 'Proyecto registrado correctamente.';

        // Limpiar modelo
        this.proyecto = {
          nombre: '',
          descripcion: '',
          actividad: '',
          necesidad: '',
          estadoProyecto: '',
          fechaInicio: '',
          fechaFin: '',
          empresaVinculada: '',
          tecnologico: null
        };

        this.imagenFile = null;
        this.documentoFile = null;

        // limpiar inputs de tipo file
        const imgInput = document.getElementById('imagenInput') as HTMLInputElement | null;
        if (imgInput) imgInput.value = '';

        const docInput = document.getElementById('documentoInput') as HTMLInputElement | null;
        if (docInput) docInput.value = '';

        form.resetForm();
      },
      error: (err) => {
        console.error('Error al registrar proyecto:', err);
        this.mensajeError = 'Ocurrió un error al registrar el proyecto.';
      }
    });
  }
}
