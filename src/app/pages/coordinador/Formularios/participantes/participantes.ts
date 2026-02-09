import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// ===================================
// INTERFAZ ACTUALIZADA
// Se añaden campos para capturar la especificación del valor "Otro"
// ===================================
export interface IParticipante {
  // A. Datos Generales
  nombreInstitucion: string;
  tipoParticipante: string;
  descripcionInstitucional: string;
  rfc: string;
  representante: string;
  cargo: string;
  correo: string;
  telefono: string;
  paginaWeb: string;
  especificacionOtroTipoParticipante: string; // Nuevo

  // B. Perfil del Participante
  sector: string;
  actividadesCafe: string;
  region: string;
  estado: string;
  impacto: string;
  especificacionOtroSector: string; // Nuevo
  especificacionOtroImpacto: string; // Nuevo

  // C. Rol en la Plataforma
  aportaciones: string; // Cambiado de string[] a string para el control
  intereses: string;     // Cambiado de string[] a string para el control
  especificacionOtroAportacion: string; // Nuevo
  especificacionOtroInteres: string; // Nuevo

  // D. Documentos
  logo: File | null;
  cartaIntencion: File | null;
}

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './participantes.html',
  styleUrls: ['./participantes.css']
})
export class ParticipantesComponent implements OnInit {

  step: number = 1; // 1: A, 2: B, 3: C, 4: D

  form!: FormGroup;

  // Variables para almacenar archivos
  logoFile: File | null = null;
  cartaFile: File | null = null;

  // Variables de control de visibilidad para los campos "Otro"
  mostrarOtroTipoParticipante: boolean = false;
  mostrarOtroSector: boolean = false;
  mostrarOtroImpacto: boolean = false;
  mostrarOtroAportacion: boolean = false;
  mostrarOtroInteres: boolean = false;


  // Listas de opciones, se añade 'Otro' al final
  tiposParticipante: string[] = [
    'Tecnológico',
    'Universidad',
    'Dependencia de Gobierno',
    'Productor',
    'Empresa',
    'ONG',
    'Otro' // Añadido
  ];

  sectores: string[] = [
    'Productivo',
    'Académico',
    'Gobierno',
    'Social',
    'Otro' // Añadido
  ];

  impactos: string[] = [
    'Local',
    'Regional',
    'Estatal',
    'Nacional',
    'Otro' // Añadido
  ];

  aportacionesLista: string[] = [
    'Datos técnicos',
    'Prácticas',
    'Capacitación',
    'Infraestructura',
    'Innovación',
    'Financiamiento',
    'Otro' // Añadido
  ];

  interesesLista: string[] = [
    'Investigación',
    'Producción',
    'Vinculación',
    'Certificación',
    'Asistencia técnica',
    'Tecnología',
    'Otro' // Añadido
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    // Suscribirse a los cambios de los selectores para gestionar la visibilidad de "Otro"
    this.form.get('tipoParticipante')?.valueChanges.subscribe(value => this.onTipoParticipanteChange(value));
    this.form.get('sector')?.valueChanges.subscribe(value => this.onSectorChange(value));
    this.form.get('impacto')?.valueChanges.subscribe(value => this.onImpactoChange(value));
    this.form.get('aportaciones')?.valueChanges.subscribe(value => this.onAportacionesChange(value));
    this.form.get('intereses')?.valueChanges.subscribe(value => this.onInteresesChange(value));
  }

  inicializarFormulario(): void {
    this.form = this.fb.group({
      // A. Datos Generales
      nombreInstitucion: ['', [Validators.required, Validators.minLength(3)]],
      tipoParticipante: ['', Validators.required],
      descripcionInstitucional: ['', [Validators.required, Validators.minLength(10)]],
      rfc: [''],
      representante: ['', Validators.required],
      cargo: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      paginaWeb: [''],
      especificacionOtroTipoParticipante: [''], // Campo auxiliar

      // B. Perfil del Participante
      sector: ['', Validators.required],
      actividadesCafe: ['', [Validators.required, Validators.minLength(10)]],
      region: ['', Validators.required],
      estado: ['', Validators.required],
      impacto: ['', Validators.required],
      especificacionOtroSector: [''], // Campo auxiliar
      especificacionOtroImpacto: [''], // Campo auxiliar

      // C. Rol en la Plataforma
      aportaciones: ['', Validators.required],
      intereses: ['', Validators.required],
      especificacionOtroAportacion: [''], // Campo auxiliar
      especificacionOtroInteres: [''], // Campo auxiliar

      // D. Documentos
      logo: [''],
      cartaIntencion: ['']
    });
  }

  // ===================================
  // Funciones de control de visibilidad y validación (Reactive Forms)
  // ===================================

  onTipoParticipanteChange(value: string): void {
    this.mostrarOtroTipoParticipante = value === 'Otro';
    if (!this.mostrarOtroTipoParticipante) {
      this.form.get('especificacionOtroTipoParticipante')?.setValue('');
    }
  }

  onSectorChange(value: string): void {
    this.mostrarOtroSector = value === 'Otro';
    if (!this.mostrarOtroSector) {
      this.form.get('especificacionOtroSector')?.setValue('');
    }
  }

  onImpactoChange(value: string): void {
    this.mostrarOtroImpacto = value === 'Otro';
    if (!this.mostrarOtroImpacto) {
      this.form.get('especificacionOtroImpacto')?.setValue('');
    }
  }

  onAportacionesChange(value: string): void {
    this.mostrarOtroAportacion = value === 'Otro';
    if (!this.mostrarOtroAportacion) {
      this.form.get('especificacionOtroAportacion')?.setValue('');
    }
  }

  onInteresesChange(value: string): void {
    this.mostrarOtroInteres = value === 'Otro';
    if (!this.mostrarOtroInteres) {
      this.form.get('especificacionOtroInteres')?.setValue('');
    }
  }

  // Obtener grupos de campos por paso (SE DEBEN INCLUIR LOS NUEVOS CAMPOS DE ESPECIFICACIÓN)
  obtenerCamposStep1() {
    return ['nombreInstitucion', 'tipoParticipante', 'especificacionOtroTipoParticipante', 'descripcionInstitucional', 'rfc', 'representante', 'cargo', 'correo', 'telefono', 'paginaWeb'];
  }

  obtenerCamposStep2() {
    return ['sector', 'especificacionOtroSector', 'actividadesCafe', 'region', 'estado', 'impacto', 'especificacionOtroImpacto'];
  }

  obtenerCamposStep3() {
    return ['aportaciones', 'especificacionOtroAportacion', 'intereses', 'especificacionOtroInteres'];
  }

  // Validar si un paso es válido (la validación se basa en si el control es requerido y su visibilidad)
  esStepValido(stepNum: number): boolean {
    let campos: string[] = [];

    if (stepNum === 1) {
      campos = ['nombreInstitucion', 'tipoParticipante', 'descripcionInstitucional', 'representante', 'cargo', 'correo', 'telefono'];
      if (this.mostrarOtroTipoParticipante) {
        campos.push('especificacionOtroTipoParticipante');
      }
    } else if (stepNum === 2) {
      campos = ['sector', 'actividadesCafe', 'region', 'estado', 'impacto'];
      if (this.mostrarOtroSector) {
        campos.push('especificacionOtroSector');
      }
      if (this.mostrarOtroImpacto) {
        campos.push('especificacionOtroImpacto');
      }
    } else if (stepNum === 3) {
      campos = ['aportaciones', 'intereses'];
      if (this.mostrarOtroAportacion) {
        campos.push('especificacionOtroAportacion');
      }
      if (this.mostrarOtroInteres) {
        campos.push('especificacionOtroInteres');
      }
    }

    // La validación se enfoca solo en los campos requeridos y que están visibles/activos
    return campos.every(campo => {
      const control = this.form.get(campo);
      // Si un campo tiene el valor 'Otro' pero su especificación está vacía, se considera inválido.
      if (
        (campo === 'especificacionOtroTipoParticipante' && this.mostrarOtroTipoParticipante && !control?.value) ||
        (campo === 'especificacionOtroSector' && this.mostrarOtroSector && !control?.value) ||
        (campo === 'especificacionOtroImpacto' && this.mostrarOtroImpacto && !control?.value) ||
        (campo === 'especificacionOtroAportacion' && this.mostrarOtroAportacion && !control?.value) ||
        (campo === 'especificacionOtroInteres' && this.mostrarOtroInteres && !control?.value)
      ) {
        return false;
      }

      // Retorna true solo si el control existe y es válido
      return control && control.valid;
    });
  }


  // Navegar al siguiente paso
  siguiente(): void {
    if (this.esStepValido(this.step) && this.step < 4) {
      this.step++;
      setTimeout(() => {
        const elemento = document.getElementById(`step-${this.step}`);
        if (elemento) {
          elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      alert(`Por favor, completa todos los campos requeridos en el paso ${this.step}. Asegúrate de especificar el valor 'Otro' si lo seleccionaste.`);
    }
  }

  // Regresar al paso anterior (código original)
  regresar(): void {
    if (this.step > 1) {
      this.step--;
      setTimeout(() => {
        const elemento = document.getElementById(`step-${this.step}`);
        if (elemento) {
          elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  // Manejar cambio de archivos (código original)
  onFileChange(event: any, tipo: 'logo' | 'cartaIntencion'): void {
    const target = event.target as HTMLInputElement;
    if (target && target.files && target.files.length > 0) {
      const file = target.files[0];
      if (tipo === 'logo') {
        this.logoFile = file;
        this.form.get('logo')?.setValue(file.name); // Para mantener el control en el FormGroup
      } else {
        this.cartaFile = file;
        this.form.get('cartaIntencion')?.setValue(file.name); // Para mantener el control en el FormGroup
      }
    }
  }

  // Guardar participante (MODIFICADO para consolidar los campos 'Otro')
  guardarParticipante(): void {
    if (this.form.valid && this.step === 4) {
      const datos: any = this.form.value;

      // Lógica de consolidación para el valor 'Otro'
      if (datos.tipoParticipante === 'Otro' && datos.especificacionOtroTipoParticipante) {
        datos.tipoParticipante = datos.especificacionOtroTipoParticipante;
      }
      if (datos.sector === 'Otro' && datos.especificacionOtroSector) {
        datos.sector = datos.especificacionOtroSector;
      }
      if (datos.impacto === 'Otro' && datos.especificacionOtroImpacto) {
        datos.impacto = datos.especificacionOtroImpacto;
      }
      if (datos.aportaciones === 'Otro' && datos.especificacionOtroAportacion) {
        datos.aportaciones = datos.especificacionOtroAportacion;
      }
      if (datos.intereses === 'Otro' && datos.especificacionOtroInteres) {
        datos.intereses = datos.especificacionOtroInteres;
      }

      // Se añaden los nombres de los archivos para el log final
      const datosCompletos: any = {
        ...datos,
        logo: this.logoFile?.name || 'Sin archivo',
        cartaIntencion: this.cartaFile?.name || 'Sin archivo'
      };

      // Opcional: Eliminar campos auxiliares antes de enviar a un backend real
      delete datosCompletos.especificacionOtroTipoParticipante;
      delete datosCompletos.especificacionOtroSector;
      delete datosCompletos.especificacionOtroImpacto;
      delete datosCompletos.especificacionOtroAportacion;
      delete datosCompletos.especificacionOtroInteres;


      console.log('=== DATOS DEL PARTICIPANTE CONSOLIDADOS ===');
      console.log(datosCompletos);
      console.log('=====================================');

      alert('✓ Datos del PARTICIPANTE guardados exitosamente.\nVerifica la consola para ver todos los datos registrados.');
    } else {
      alert('Por favor, completa todos los pasos del formulario antes de guardar.');
    }
  }
}