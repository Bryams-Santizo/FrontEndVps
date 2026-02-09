import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ===================================
// INTERFAZ IMapaRegional COMPLETA
// (Se mantuvo igual, pero se muestra por claridad)
// ===================================
export interface IMapaRegional {
    // 1. Datos del Tecnológico
    institucion: string;
    departamentoAcademia: string;
    nombreResponsableLevantamiento: string;
    carreraParticipante: string;
    equipoDeCampo: string;
    fechaLevantamiento: string;
    municipioLevantamiento: string;

    // 2. Identificación del Actor
    nombreActor: string;
    tipoActor: string;
    especificacionOtroTipoActor: string;
    razonSocial: string; 
    representanteContacto: string; 
    cargoContacto: string; 
    telefono: string;
    correoElectronico: string;
    
    // 3. Ubicación Geográfica
    regionGeografica: string;
    municipioGeografico: string;
    localidadEjido: string;
    direccion: string;
    latitudGPS: string; 
    longitudGPS: string; 

    // Campos preexistentes
    presencia: string;
    especificacionOtroPresencia: string;
    tamanio: string;
    especificacionOtroTamanio: string;
    descripcionOfertaServicios: string;
    municipiosAtiende: string;
    certificaciones: string; 
    redesSociales: string; 
    ofertaCapacitacion: string; 

    // 4. Caracterización Productiva
    superficieTotalCafeHa: number | null; 
    numProductoresAsociados: number | null; 
    altitudPromedioMsnm: number | null; 
    altitudMinima: number | null; 
    altitudMaxima: number | null; 
    variedadesCultivadas: string[]; 
    especificacionOtraVariedad: string; 
    produccionAnual: number | null; 
    unidadProduccion: string; 

    // 5. Infraestructura
    infraViveros: boolean; 
    infraSistemasSombra: boolean; 
    infraRiego: boolean; 
    infraMaquinariaAgricola: boolean; 
    infraDespulpadora: boolean; 
    infraDesmucilaginador: boolean; 
    infraFermentacion: boolean; 
    infraSecadoraSol: boolean; 
    infraSecadoraMecanica: boolean; 
    infraTostador: boolean; 
    infraMolino: boolean; 
    infraEmpacadora: boolean; 
    infraLaboratorioCalidad: boolean; 
    infraPuntoVenta: boolean; 
    infraMarcaPropia: boolean; 
    certificacionesDetalle: string[]; 

    // 6. Necesidades y Oportunidades de Colaboración
    necesidadesExpresadas: string[]; 
    necesidadDescripcionLibre: string; 
    posiblesProyectosITFC: string; 
    areasColaboracionITFC: string[]; 
    especificacionOtraAreaITFC: string; 

    // 7. Documentación Adjunta
    documentacionAdjunta: string; 

    // 8. Validación
    voboCoordinador: string; 
    fechaValidacion: string; 
}

@Component({
  selector: 'app-mapa-regional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapas_regionales.html',
  styleUrls: ['./mapas_regionales.css']
})
export class MapaRegionalComponent implements OnInit {

    // Inicialización del objeto con TODOS los campos de la interfaz
    mapaRegional: IMapaRegional = {
        // 1. Datos del Tecnológico
        institucion: '',
        departamentoAcademia: '',
        nombreResponsableLevantamiento: '',
        carreraParticipante: '',
        equipoDeCampo: '',
        fechaLevantamiento: '',
        municipioLevantamiento: '',

        // 2. Identificación del Actor
        nombreActor: '',
        tipoActor: '',
        razonSocial: '', 
        representanteContacto: '', 
        cargoContacto: '', 
        telefono: '',
        correoElectronico: '',
        
        // 3. Ubicación Geográfica (CAMPOS CORREGIDOS)
        regionGeografica: '',
        municipioGeografico: '',
        localidadEjido: '',
        direccion: '',
        latitudGPS: '', 
        longitudGPS: '', 

        // Campos de identificación/contacto/presencia
        presencia: '',
        tamanio: '',
        descripcionOfertaServicios: '',
        municipiosAtiende: '',
        certificaciones: '',
        redesSociales: '',
        ofertaCapacitacion: '',
        
        // Campos de especificación "Otro"
        especificacionOtroTipoActor: '',
        especificacionOtroPresencia: '',
        especificacionOtroTamanio: '',
        
        // 4. Caracterización Productiva
        superficieTotalCafeHa: null, 
        numProductoresAsociados: null, 
        altitudPromedioMsnm: null, 
        altitudMinima: null, 
        altitudMaxima: null, 
        variedadesCultivadas: [], 
        especificacionOtraVariedad: '', 
        produccionAnual: null, 
        unidadProduccion: '', 

        // 5. Infraestructura
        infraViveros: false, 
        infraSistemasSombra: false, 
        infraRiego: false, 
        infraMaquinariaAgricola: false, 
        infraDespulpadora: false, 
        infraDesmucilaginador: false, 
        infraFermentacion: false, 
        infraSecadoraSol: false, 
        infraSecadoraMecanica: false, 
        infraTostador: false, 
        infraMolino: false, 
        infraEmpacadora: false, 
        infraLaboratorioCalidad: false, 
        infraPuntoVenta: false, 
        infraMarcaPropia: false, 
        certificacionesDetalle: [], 

        // 6. Necesidades y Oportunidades de Colaboración
        necesidadesExpresadas: [], 
        necesidadDescripcionLibre: '', 
        posiblesProyectosITFC: '', 
        areasColaboracionITFC: [], 
        especificacionOtraAreaITFC: '', 

        // 7. Documentación Adjunta
        documentacionAdjunta: '', 

        // 8. Validación
        voboCoordinador: '', 
        fechaValidacion: '' 
    };

    // Variables para controlar la visibilidad de los campos de especificación en el HTML
    mostrarCampoOtroTipoActor: boolean = false;
    mostrarCampoOtroNivelPresencia: boolean = false;
    mostrarCampoOtroTamanio: boolean = false;
    mostrarCampoOtraAreaITFC: boolean = false; 

    // Listas de opciones
    tiposActor: string[] = [
        'Productor individual',
        'Grupo de productores / Sociedad de producción rural',
        'Cooperativa / Organización',
        'Acopiador',
        'Beneficiador húmedo',
        'Beneficiador seco',
        'Tostador / Molino',
        'Exportadora',
        'Comercializadora',
        'Empresa de productos o servicios (insumos, maquinaria, transporte, asistencia técnica, etc.)',
        'Ayuntamiento / Dependencia gubernamental',
        'Universidad / Centro de investigación',
        'Otro' 
    ];

    nivelesPresencia: string[] = [
        'Regional',
        'Estatal',
        'Nacional',
        'Internacional',
        'Otro'
    ];

    tamanios: string[] = [
        'Pequeño',
        'Mediano',
        'Grande',
        'Otro'
    ];
    
    unidadesProduccion: string[] = ['Quintales pergamino', 'Q oro', 'Toneladas']; 
    
    variedadesCafe: string[] = [
        'Typica', 'Bourbon', 'Caturra', 'Catuaí', 'Costa Rica 95', 'Marsellesa', 'Geisha', 'Garnica', 'Sarchimor', 'Otra'
    ];
    
    certificacionesComercializacion: string[] = [
        'Orgánico', 'RA', 'Comercio Justo', 'DO', 'Café de especialidad'
    ];

    necesidadesOpciones: string[] = [
        'Asistencia técnica', 'Diagnóstico productivo', 'Mejora de procesos', 'Desarrollo de marca', 
        'Digitalización', 'Análisis de suelos / laboratorio', 'Evaluación financiera', 'Capacitación', 
        'Vinculación para venta', 'Certificaciones', 'Infraestructura'
    ];

    areasITFC: string[] = [
        'Agronomía', 'IAS', 'Sistemas', 'Gestión Empresarial', 'Industrial', 'Civil', 'Contaduría', 
        'Laboratorios del ITFC', 'Otra'
    ];

    constructor() {}
    ngOnInit(): void {}
    
    // ===================================
    // Funciones de control de visibilidad
    // ===================================
    onTipoActorChange(): void {
        this.mostrarCampoOtroTipoActor = this.mapaRegional.tipoActor === 'Otro';
        if (!this.mostrarCampoOtroTipoActor) {
            this.mapaRegional.especificacionOtroTipoActor = '';
        }
    }

    onNivelPresenciaChange(): void {
        this.mostrarCampoOtroNivelPresencia = this.mapaRegional.presencia === 'Otro';
        if (!this.mostrarCampoOtroNivelPresencia) {
            this.mapaRegional.especificacionOtroPresencia = '';
        }
    }

    onTamanioChange(): void {
        this.mostrarCampoOtroTamanio = this.mapaRegional.tamanio === 'Otro';
        if (!this.mostrarCampoOtroTamanio) {
            this.mapaRegional.especificacionOtroTamanio = '';
        }
    }

    onAreaITFCChangeHelper(): void {
        this.mostrarCampoOtraAreaITFC = this.mapaRegional.areasColaboracionITFC.includes('Otra');
        if (!this.mostrarCampoOtraAreaITFC) {
            this.mapaRegional.especificacionOtraAreaITFC = '';
        }
    }
    
    // ===================================
    // Funciones para Checkboxes Múltiples
    // ===================================
    toggleArrayValue(array: string[], value: string, isChecked: boolean): string[] {
        if (isChecked) {
            if (!array.includes(value)) {
                array.push(value);
            }
        } else {
            array = array.filter(v => v !== value);
        }
        return array;
    }

    onVariedadChange(variedad: string, event: any): void {
        this.mapaRegional.variedadesCultivadas = this.toggleArrayValue(
            this.mapaRegional.variedadesCultivadas, 
            variedad, 
            event.target.checked
        );
    }
    
    onCertificacionDetalleChange(cert: string, event: any): void {
        this.mapaRegional.certificacionesDetalle = this.toggleArrayValue(
            this.mapaRegional.certificacionesDetalle, 
            cert, 
            event.target.checked
        );
    }
    
    onNecesidadChange(necesidad: string, event: any): void {
        this.mapaRegional.necesidadesExpresadas = this.toggleArrayValue(
            this.mapaRegional.necesidadesExpresadas, 
            necesidad, 
            event.target.checked
        );
    }

    onAreaITFCChange(area: string, event: any): void {
        this.mapaRegional.areasColaboracionITFC = this.toggleArrayValue(
            this.mapaRegional.areasColaboracionITFC, 
            area, 
            event.target.checked
        );
        this.onAreaITFCChangeHelper();
    }


    guardarDatos(): void {
        const datosFinales: IMapaRegional = { ...this.mapaRegional };
        
        // Consolidación de campos "Otro"
        if (datosFinales.tipoActor === 'Otro' && datosFinales.especificacionOtroTipoActor) {
            datosFinales.tipoActor = datosFinales.especificacionOtroTipoActor;
        }
        if (datosFinales.presencia === 'Otro' && datosFinales.especificacionOtroPresencia) {
            datosFinales.presencia = datosFinales.especificacionOtroPresencia;
        }
        if (datosFinales.tamanio === 'Otro' && datosFinales.tamanio) {
            datosFinales.tamanio = datosFinales.especificacionOtroTamanio;
        }
        if (datosFinales.areasColaboracionITFC.includes('Otra') && datosFinales.especificacionOtraAreaITFC) {
            datosFinales.areasColaboracionITFC = datosFinales.areasColaboracionITFC.map(area => 
                area === 'Otra' ? datosFinales.especificacionOtraAreaITFC : area
            );
        }

        console.log('Datos del Mapa Regional (FINAL a guardar):', datosFinales);
        alert('Datos de MAPA REGIONAL listos para enviar.');
    }
}