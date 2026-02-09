import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IRegionalData {
  nombreRegion: string;
  municipios: string[];
  actoresDetalle: { 
    productores: number; cooperativas: number; acopiadores: number; 
    exportadores: number; tostadores: number; proveedores: number; ayuntamientos: number; 
  };
  productoresPorTamano: { small: number; medium: number; large: number; promedioSuperficie: string };
  rangoAltitudinal: string;
  altitudPromedio: number;
  variedadesPredominantes: string[];
  produccionEstimada: string;
  totalProduccion: string;
}

interface IMunicipioData {
  nombre: string;
  zona: string;
  // Detalle de actores
  actores: {
    productores: string;
    cooperativas: string;
    exportacion: string;
    ayuntamiento: string;
  };
  // Detalle de productores
  infoProductores: {
    perfil: string;
    promedioFinca: string;
  };
  altura: string;
  variedades: string[];
  produccionHa: string;
  clima: string;
}

let L: any = null;

@Component({
  selector: 'app-mapas-regionales',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './MapasR.html',
  styleUrls: ['./MapasR.css']
})
export class MapaR implements OnInit, AfterViewInit {
  private map: any;
  private markersGroup: any = null;
  public isLoading = true;
  public selectedRegionData: IRegionalData | null = null;
  public esChiapasVisible = false;
  private chiapasLayer: any = null;
  public selectedMunicipio: IMunicipioData | null = null;

  eslabones = ['Producción', 'Beneficiado', 'Tostado', 'Comercialización'];
  certificaciones = ['Orgánico', 'Café de especialidad', 'Comercio justo', 'Rainforest', 'Denominación de origen'];
  tecnologicos = ['ITFC', 'TecNM Tuxtla', 'TecNM Tapachula', 'TecNM Comitán'];
  selectedTec = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private ngZone: NgZone, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const leafletModule = await import('leaflet');
      L = leafletModule.default || leafletModule;
      this.initMap();
    }
  }

  private initMap() {
    if (!L) return;
    this.map = L.map('map-container').setView([23.6, -102.5], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.markersGroup = L.layerGroup().addTo(this.map);
    
    this.cargarNivelPais();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  public seleccionarMunicipio(nombreMun: string, zona: string) {

const DATOS_MUNICIPIOS: { [key: string]: Omit<IMunicipioData, 'nombre' | 'zona'> } = {
  // Soconusco
  "Cacahoatán": {
      actores: {
        productores: "Parte de ~708 organizados en FEDECOS",
        cooperativas: "Miembros de FEDECOS",
        exportacion: "Vía organizaciones cooperativas (FEDECOS)",
        ayuntamiento: "Gobierno municipal local"
      },
      infoProductores: {
        perfil: "Pequeños (>90%), pocos medianos/grandes",
        promedioFinca: "<5 ha"
      },
      altura: "300 m hasta más de 1,900 m (Volcán Tacaná)",
      variedades: ["Arábica (Bourbon, Caturra, Catimor)"],
      produccionHa: "10,500 ha de café",
      clima: "Templado Húmedo"
    },
    "Huehuetán": {
      actores: {
        productores: "Agrícolas con café entre cultivos",
        cooperativas: "Vinculadas a FEDECOS",
        exportacion: "FEDECOS",
        ayuntamiento: "Local"
      },
      infoProductores: {
        perfil: "Mayoritariamente pequeños",
        promedioFinca: "Dato pendiente"
      },
      altura: "~100–800 m (costera a faldas)",
      variedades: ["Arábica"],
      produccionHa: "2,891 ha de café",
      clima: ""
    },
   "Huixtla": {
    actores: {
      productores: "Aprox. 1,200 productores",
      cooperativas: "AMSA, Café California y cooperativas del Soconusco",
      exportacion: "Comercialización regional y nacional",
      ayuntamiento: "Dirección de Desarrollo Rural"
    },
    infoProductores: { perfil: "Zonas bajas y de transición", promedioFinca: "2.8 hectáreas" },
    altura: "50 - 900 msnm",
    variedades: ["Arábica (Catimor, Sarchimor)"],
    produccionHa: "Aprox. 4,500 hectáreas",
    clima: "Cálido húmedo"
  },
    "Tapachula": {
    actores: {
      productores: "Aprox. 8,000 productores",
      cooperativas: "AMSA, Café California, Cafesca, CASFA, Soconusco Coop",
      exportacion: "Comercialización internacional",
      ayuntamiento: "Dirección de Desarrollo Rural"
    },
    infoProductores: { perfil: "Zonas bajas, medias y sierra", promedioFinca: "3 hectáreas" },
    altura: "200 – 1,200 msnm",
    variedades: ["Arábica (Catimor, Sarchimor, Bourbon)"],
    produccionHa: "Aprox. 28,000 hectáreas",
    clima: "Cálido húmedo y subhúmedo"
  },
    "Tuxtla Chico": {
      actores: {
        productores: "Mayoría pequeños",
        cooperativas: "FEDECOS",
        exportacion: "FEDECOS",
        ayuntamiento: "Local"
      },
      infoProductores: {
        perfil: "Mayoría pequeños",
        promedioFinca: "Dato pendiente"
      },
      altura: "Baja a media (~150-900 m)",
      variedades: ["Arábica"],
      produccionHa: "1,712 ha de café",
      clima: ""
    },
    "Tuzantán": {
      actores: {
        productores: "Principalmente pequeños",
        cooperativas: "FEDECOS",
        exportacion: "FEDECOS",
        ayuntamiento: "Local"
      },
      infoProductores: {
        perfil: "Principalmente pequeños",
        promedioFinca: "Dato pendiente"
      },
      altura: "~50-700 m",
      variedades: ["Arábica"],
      produccionHa: "6,413 ha de café",
      clima: ""
    },
    "Unión Juárez": {
      actores: {
        productores: "Pequeños productores",
        cooperativas: "FEDECOS",
        exportacion: "FEDECOS",
        ayuntamiento: "Local"
      },
      infoProductores: {
        perfil: "Mayoritariamente pequeños",
        promedioFinca: "Dato pendiente"
      },
      altura: "Media a alta (faldas del Tacaná)",
      variedades: ["Arábica"],
      produccionHa: "3,675 ha de café",
      clima: "Fresco / Templado"
    },


  // --- REGIÓN LOS ALTOS ---
 "Chenalhó": {
  actores: {
    productores: "5,500 productores (Población muy densa)",
    cooperativas: "Muy alto (Acteal, Las Abejas, red Café Maya)",
    exportacion: "Exportación a Europa (Alemania) y EE. UU. vía uniones",
    ayuntamiento: "Dir. de Asuntos Indígenas y Fomento Agropecuario"
  },
  infoProductores: {
    perfil: "Pequeños 95% (5,225), Medianos 4%, Grandes 1%",
    promedioFinca: "1.2 hectáreas"
  },
  altura: "1,200 - 1,700 msnm",
  variedades: ["Arábica (Bourbon, Typica, Caturra, Mundo Novo)"],
  produccionHa: "12,000 toneladas de café cereza aprox.",
  clima: "Templado Húmedo"
},

"Pantelhó": {
  actores: {
    productores: "3,800 productores",
    cooperativas: "5 principales (Afiliadas a Unión de Caficultores de la Selva)",
    exportacion: "Indirecta a través de organizaciones de segundo piso",
    ayuntamiento: "Oficina de Desarrollo Rural"
  },
  infoProductores: {
    perfil: "Pequeños 93% (3,534), Medianos 6%, Grandes 1%",
    promedioFinca: "1.5 hectáreas"
  },
  altura: "1,000 - 1,550 msnm",
  variedades: ["Arábica (Typica y Bourbon predominan)"],
  produccionHa: "8,500 toneladas de café cereza aprox.",
  clima: "Templado Semicálido"
},

"Tenejapa": {
  actores: {
    productores: "3,200 productores",
    cooperativas: "Sede de la cooperativa 'Tenejapa' y grupos orgánicos",
    exportacion: "Mercados de especialidad y venta directa en San Cristóbal",
    ayuntamiento: "Fomento Agropecuario (Enfoque Orgánico)"
  },
  infoProductores: {
    perfil: "Pequeños 92% (2,944), Medianos 7%, Grandes 1%",
    promedioFinca: "1.4 hectáreas"
  },
  altura: "1,400 - 1,900 msnm (Café de alta densidad)",
  variedades: ["Arábica (Bourbon, Mundo Novo, Caturra)"],
  produccionHa: "6,000 toneladas de café cereza aprox.",
  clima: "Templado (Bosque de niebla)"
},

"Oxchuc": {
  actores: {
    productores: "2,500 productores",
    cooperativas: "Grupos comunitarios vinculados a Ocosingo",
    exportacion: "Principalmente a través de intermediarios",
    ayuntamiento: "Dirección de Desarrollo Rural"
  },
  infoProductores: {
    perfil: "Pequeños 95% (2,375), Medianos 4%, Grandes 1%",
    promedioFinca: "1.1 hectáreas"
  },
  altura: "1,500 - 2,000 msnm",
  variedades: ["Arábica (Variedades resistentes y criollas)"],
  produccionHa: "4,200 toneladas de café cereza aprox.",
  clima: "Templado"
},

"San Cristóbal de las Casas": {
  actores: {
    productores: "800 productores (Zonas periféricas/Mitzitón)",
    cooperativas: "Hub administrativo; oficinas de casi todas las cooperativas",
    exportacion: "Punto de venta, tostado y exportación de especialidad",
    ayuntamiento: "Dir. de Desarrollo Económico y Turismo (Ruta del Café)"
  },
  infoProductores: {
    perfil: "Pequeños 96% (768), Medianos 4%, Grandes 0%",
    promedioFinca: "0.8 hectáreas"
  },
  altura: "2,100 - 2,400 msnm (Producción en laderas)",
  variedades: ["Arábica (Typica, Bourbon)"],
  produccionHa: "1,200 toneladas de café cereza aprox.",
  clima: "Frío / Templado"
},

"Huixtán": {
    actores: {
      productores: "~850 productores",
      cooperativas: "Organizaciones indígenas (Tseltal-Tsotsil)",
      exportacion: "Comercio Justo y mercado nacional",
      ayuntamiento: "Departamento de Fomento Agropecuario"
    },
    infoProductores: { perfil: "Productores de zona alta", promedioFinca: "0.8 a 1.5 hectáreas" },
    altura: "1,100 – 1,600 msnm",
    variedades: ["Arábica (Bourbon, Caturra, Sarchimor)"],
    produccionHa: "1,200 hectáreas estimadas",
    clima: "Templado húmedo"
  },

// --- REGIÓN SIERRA MADRE ---
// --- REGIÓN SIERRA MADRE ---
"Motozintla": {
  actores: {
    productores: "989 productores registrados",
    cooperativas: "Fuerte presencia de organizaciones regionales",
    exportacion: "Mercado nacional y exportación de altura",
    ayuntamiento: "Oficina de fomento agropecuario"
  },
  infoProductores: {
    perfil: "Pequeños y medianos productores de altura",
    promedioFinca: "1.5 a 3 hectáreas"
  },
  altura: "1,200 - 2,200 msnm",
  variedades: ["Arábica (Typica, Bourbon, Caturra)"],
  produccionHa: "15,797 hectáreas sembradas",
  clima: "Templado húmedo"
},

"Siltepec": {
  actores: {
    productores: "1,427 productores (Alta densidad)",
    cooperativas: "Cooperativas orgánicas y de comercio justo",
    exportacion: "Alta participación en mercados de especialidad",
    ayuntamiento: "Desarrollo Rural Municipal"
  },
  infoProductores: {
    perfil: "Pequeños productores (Mayoría indígena y campesina)",
    promedioFinca: "1.2 hectáreas"
  },
  altura: "1,400 - 2,500 msnm",
  variedades: ["Arábica (Bourbon, Mundo Novo, Garnica)"],
  produccionHa: "9,421 hectáreas sembradas",
  clima: "Templado (Bosque de niebla)"
},

"El Porvenir": {
  actores: {
    productores: "117 productores registrados",
    cooperativas: "Organizaciones de alta montaña",
    exportacion: "Café estrictamente altura (SHG)",
    ayuntamiento: "Oficina de apoyo al campo"
  },
  infoProductores: {
    perfil: "Pequeños productores de zonas gélidas",
    promedioFinca: "1.0 hectárea"
  },
  altura: "2,100 - 2,800 msnm",
  variedades: ["Arábica (Variedades de ciclo largo)"],
  produccionHa: "140 hectáreas sembradas",
  clima: "Frío (Alta montaña)"
},
"Chicomuselo": {
  actores: {
    productores: "~420 productores",
    cooperativas: "Redes cooperativas de café de la Sierra Mariscal (regional)",
    exportacion: "Comercialización cooperativa a mercados nacionales (exportación indirecta)",
    ayuntamiento: "Departamento de Desarrollo Rural y vinculación productiva"
  },
  infoProductores: {
    perfil: "Productores de zonas serranas del municipio",
    promedioFinca: "2–5 hectáreas"
  },
  altura: "591 msnm",
  variedades: ["Café arábico"],
  produccionHa: "4,519 hectáreas sembradas",
  clima: "Cálido subhúmedo"
},
"Capitán Luis Ángel Vidal": {
  actores: {
    productores: "~500 productores",
    cooperativas: "Café Capitán Luis A. Vidal S.P.R. de R.L.",
    exportacion: "Café de especialidad exportado a Europa (ej. Bélgica)",
    ayuntamiento: "Oficina de Desarrollo Rural Municipal"
  },
  infoProductores: {
    perfil: "Productores de zonas altas y faldas de la Reserva El Triunfo",
    promedioFinca: "~3 hectáreas"
  },
  altura: "850 – 1,850 msnm",
  variedades: [
    "Bourbon",
    "Arábiga",
    "Mundo Novo",
    "Costa Rica 95",
    "Peñasco",
    "Marcelleza"
  ],
  produccionHa: "1,509 hectáreas sembradas",
  clima: "Cálido subhúmedo"
},
"Honduras de la Sierra": {
  actores: {
    productores: "~180 productores",
    cooperativas: "Integración en cooperativas regionales (estimado)",
    exportacion: "Canalizada mediante asociaciones de la región Sierra",
    ayuntamiento: "Dirección de Desarrollo Rural Municipal"
  },
  infoProductores: {
    perfil: "Productores de áreas montañosas",
    promedioFinca: "2–4 hectáreas (estimado regional)"
  },
  altura: "~1,202 msnm",
  variedades: ["Café arábica"],
  produccionHa: "No disponible por municipio",
  clima: "Templado subhúmedo"
},
"Bella Vista": {
  actores: {
    productores: "~260 productores",
    cooperativas: "Participación menor en redes cooperativas regionales (estimado)",
    exportacion: "Comercialización vía asociaciones regionales",
    ayuntamiento: "Oficina municipal de apoyo rural"
  },
  infoProductores: {
    perfil: "Productores de serranía rural",
    promedioFinca: "2–4 hectáreas (estimado)"
  },
  altura: "~1,580 msnm",
  variedades: ["Café arábico (presencia regional estimada)"],
  produccionHa: "Sin datos oficiales desagregados",
  clima: "Templado subhúmedo"
},
"Bejucal de Ocampo": {
  actores: {
    productores: "~140 productores",
    cooperativas: "Participación regional en actividades agrícolas y cafetaleras (estimado)",
    exportacion: "A través de redes productivas regionales",
    ayuntamiento: "Área de Desarrollo Rural Municipal"
  },
  infoProductores: {
    perfil: "Productores de zonas elevadas de la Sierra",
    promedioFinca: "2-4 hectáreas (estimado)"
  },
  altura: "~2,316 msnm",
  variedades: ["Café arábico (producción a menor escala)"],
  produccionHa: "No existe dato oficial por cultivo",
  clima: "Templado frío subhúmedo"
},


"Frontera Comalapa": {
    actores: {
      productores: "229 productores",
      cooperativas: "AMSA y cooperativas de la Sierra Madre",
      exportacion: "Café California y Comercialización regional",
      ayuntamiento: "Dirección de Desarrollo Rural"
    },
    infoProductores: { perfil: "Zonas bajas y de transición", promedioFinca: "2.5 hectáreas" },
    altura: "600- 1,100 msnm",
    variedades: ["Arábica (Catimor, Sarchimor)"],
    produccionHa: "1,130 hectáreas sembradas",
    clima: "Cálido subhúmedo"
  },

"Amatenango de la Frontera": {
    actores: {
      productores: "~2,100 productores (Región El Pacayal)",
      cooperativas: "Cooperativas de la Sierra Madre / Grupos de especialidad",
      exportacion: "Comercialización internacional (Taza especial)",
      ayuntamiento: "Dirección de Desarrollo Rural"
    },
    infoProductores: { perfil: "Productores de zonas altas y muy altas", promedioFinca: "1.2 hectáreas" },
    altura: "1,000 – 1,700 msnm",
    variedades: ["Arábica (Garnica, Catuai, Caturra)"],
    produccionHa: "3,800 hectáreas sembradas",
    clima: "Cálido húmedo y Templado húmedo"
  },

"La Grandeza": {
  actores: {
    productores: "Dato pendiente (Registrado en PDF)",
    cooperativas: "Grupos locales pequeños",
    exportacion: "Intermediarios regionales",
    ayuntamiento: "Representación municipal"
  },
  infoProductores: {
    perfil: "Pequeños caficultores de subsistencia",
    promedioFinca: "0.9 hectáreas"
  },
  altura: "1,800 - 2,400 msnm",
  variedades: ["Arábica (Typica, Bourbon)"],
  produccionHa: "138 hectáreas sembradas",
  clima: "Templado Frío"
},

"Mazapa de Madero": {
  actores: {
    productores: "Dato pendiente (Producción mínima)",
    cooperativas: "Vinculados a Motozintla",
    exportacion: "Venta local",
    ayuntamiento: "Fomento municipal"
  },
  infoProductores: {
    perfil: "Productores familiares",
    promedioFinca: "Menos de 1 hectárea"
  },
  altura: "1,000 - 1,800 msnm",
  variedades: ["Arábica criolla"],
  produccionHa: "3 hectáreas sembradas (Micro-producción)",
  clima: "Templado semicálido"
},

// --- REGIÓN SELVA ---
"Ocosingo": {
    actores: {
      productores: "~8,500 productores",
      cooperativas: "Organizaciones comunitarias (ej. Tiemelonla)",
      exportacion: "Comercialización regional y centros de acopio",
      ayuntamiento: "Dirección de Desarrollo Rural Municipal"
    },
    infoProductores: { perfil: "Dispersa (Zonas bajas, medias y altas)", promedioFinca: "1.8 hectáreas" },
    altura: "400 - 1,200 msnm",
    variedades: ["Arábica (Catimor, Typica) y Robusta"],
    produccionHa: "15,400 hectáreas sembradas",
    clima: "Cálido húmedo"
  },

  "Altamirano": {
    actores: {
      productores: "~2,500 productores",
      cooperativas: "Cooperativa Yashalum / Grupos sociales",
      exportacion: "Café con enfoque social y orgánico",
      ayuntamiento: "Secretaría de Fomento Agropecuario"
    },
    infoProductores: { perfil: "Productores de zona media", promedioFinca: "1.2 hectáreas" },
    altura: "900 - 1,300 msnm",
    variedades: ["Arábica (Bourbon, Caturra)"],
    produccionHa: "3,100 hectáreas estimadas",
    clima: "Semicálido húmedo"
  },

  

"Yajalón": {
  actores: { productores: "940 productores", cooperativas: "Alta tradición cooperativista", exportacion: "Mercados europeos y nacionales", ayuntamiento: "Desarrollo Rural" },
  infoProductores: { perfil: "Pequeños productores de tradición", promedioFinca: "1.5 hectáreas" },
  altura: "800 - 1,400 msnm",
  variedades: ["Arábica (Typica, Mundo Novo)"],
  produccionHa: "9,606 hectáreas sembradas",
  clima: "Cálido Húmedo"
},
"Chilón": {
  actores: { productores: "803 productores registrados", cooperativas: "Fuertes lazos con cooperativas de Ocosingo", exportacion: "Exportación indirecta", ayuntamiento: "Oficina de apoyo rural" },
  infoProductores: { perfil: "Pequeños productores indígenas", promedioFinca: "1.3 hectáreas" },
  altura: "800 - 1,300 msnm",
  variedades: ["Arábica (Bourbon, Caturra)"],
  produccionHa: "13,285 hectáreas sembradas",
  clima: "Cálido Húmedo"
},
"Palenque": {
    actores: {
      productores: "~500 productores",
      cooperativas: "Grupos locales de la región selva",
      exportacion: "Consumo regional y nacional",
      ayuntamiento: "Dirección de Desarrollo Rural"
    },
    infoProductores: { perfil: "Zonas bajas", promedioFinca: "2 – 4 hectáreas" },
    altura: "100 – 600 msnm",
    variedades: ["Arábica, Catimor, híbridos resistentes"],
    produccionHa: "~2,000 hectáreas estimadas",
    clima: "Cálido húmedo"
  },
"Salto de Agua": {
  actores: { productores: "Dato pendiente (Producción menor)", cooperativas: "Mínimas", exportacion: "Intermediarios locales", ayuntamiento: "Apoyo rural" },
  infoProductores: { perfil: "Productores diversificados", promedioFinca: "2.0 hectáreas" },
  altura: "10 - 200 msnm",
  variedades: ["Robusta"],
  produccionHa: "35 hectáreas sembradas",
  clima: "Cálido Húmedo"
},

// --- REGIÓN NORTE ---
"Cintalapa": {
    actores: {
      productores: "~200 productores",
      cooperativas: "Grupos locales de la zona norte",
      exportacion: "Mercado nacional",
      ayuntamiento: "Fomento Agropecuario"
    },
    infoProductores: { perfil: "Productores de zona norte", promedioFinca: "2 hectáreas" },
    altura: "600 – 1,200 msnm",
    variedades: ["Arábica (Catimor, Costa Rica 95), Sarchimor"],
    produccionHa: "~900 hectáreas estimadas",
    clima: "Cálido subhúmedo"
  },

"Pichucalco": {
  actores: { productores: "7 productores (Producción incipiente)", cooperativas: "Nulas", exportacion: "Local", ayuntamiento: "Fomento Agropecuario" },
  infoProductores: { perfil: "Productores de transición", promedioFinca: "1.0 hectárea" },
  altura: "400 - 800 msnm",
  variedades: ["Robusta", "Costa Rica"],
  produccionHa: "16 hectáreas sembradas",
  clima: "Cálido Húmedo"
},
"Amatán": {
  actores: { productores: "107 productores registrados", cooperativas: "Pequeñas agrupaciones locales", exportacion: "Regional", ayuntamiento: "Desarrollo Municipal" },
  infoProductores: { perfil: "Pequeños caficultores", promedioFinca: "1.2 hectáreas" },
  altura: "600 - 1,100 msnm",
  variedades: ["Arábica", "Oro Azteca"],
  produccionHa: "450 hectáreas sembradas",
  clima: "Cálido Húmedo / Templado"
},
"Ixtacomitán": {
  actores: { productores: "3 productores", cooperativas: "Nulas", exportacion: "Local", ayuntamiento: "Apoyo campo" },
  infoProductores: { perfil: "Productores familiares", promedioFinca: "0.5 hectáreas" },
  altura: "400 - 900 msnm",
  variedades: ["Arábica"],
  produccionHa: "3 hectáreas sembradas",
  clima: "Cálido Húmedo"
},
"Solosuchiapa": {
  actores: { productores: "1 productor registrado", cooperativas: "Nulas", exportacion: "Local", ayuntamiento: "Local" },
  infoProductores: { perfil: "Productor independiente", promedioFinca: "1.0 hectárea" },
  altura: "500 - 1,000 msnm",
  variedades: ["Arábica"],
  produccionHa: "1 hectárea sembrada",
  clima: "Cálido Húmedo"
},

// --- REGIÓN COMITÁN ---

"Comitán de Domínguez": {
  actores: {
    productores: "~350 productores (estimado regional)",
    cooperativas: "Participación en cooperativas y asociaciones cafetaleras de la región Altos–Fronteriza",
    exportacion: "Canales regionales y comercializadores estatales",
    ayuntamiento: "Dirección de Desarrollo Agropecuario Municipal"
  },
  infoProductores: {
    perfil: "Pequeños y medianos productores en zonas rurales y de altura",
    promedioFinca: "2–5 hectáreas (estimado regional)"
  },
  altura: "~1,600 msnm",
  variedades: ["Café arábica"],
  produccionHa: "No disponible por municipio",
  clima: "Templado subhúmedo con lluvias en verano"
},


"Nuevo San Juan Chamula": {
    actores: {
      productores: "~1,200 productores",
      cooperativas: "Unión de Ejidos de la Selva / Sociedades de Solidaridad Social",
      exportacion: "Café orgánico de exportación (Europa/EE.UU.)",
      ayuntamiento: "Coordinación de Fomento Agropecuario"
    },
    infoProductores: { perfil: "Productores de zona alta y montaña", promedioFinca: "1.5 hectáreas" },
    altura: "1,500 msnm",
    variedades: ["Arábica (Typica, Bourbon, Mundo Novo)"],
    produccionHa: "1,450 hectáreas estimadas",
    clima: "Templado subhúmedo"
  },

"Las Margaritas": {
    actores: {
      productores: "~700 productores (Zona El Mérito)",
      cooperativas: "Organizaciones locales vinculadas a la Selva",
      exportacion: "Comercialización regional y centros de acopio",
      ayuntamiento: "Dirección de Desarrollo Rural Municipal"
    },
    infoProductores: { perfil: "Zonas medias", promedioFinca: "2.0 hectáreas" },
    altura: "800 – 1,200 msnm",
    variedades: ["Arábica (Catimor, Typica)"],
    produccionHa: "1,900 hectáreas (Zona influencia)",
    clima: "Cálido húmedo"
  },
"La Trinitaria": {
  actores: { productores: "10 productores registrados", cooperativas: "Nulas", exportacion: "Local", ayuntamiento: "Fomento Económico" },
  infoProductores: { perfil: "Productores pequeños de frontera", promedioFinca: "1.5 hectáreas" },
  altura: "600 - 1,100 msnm",
  variedades: ["Arábica"],
  produccionHa: "123 hectáreas sembradas",
  clima: "Cálido Subhúmedo"
},
"Independencia": {
  actores: { productores: "Dato pendiente (Superficie registrada)", cooperativas: "Grupos locales", exportacion: "Regional", ayuntamiento: "Desarrollo Rural" },
  infoProductores: { perfil: "Productores de transición", promedioFinca: "1.2 hectáreas" },
  altura: "1,000 - 1,500 msnm",
  variedades: ["Caturra", "Bourbon"],
  produccionHa: "351 hectáreas sembradas",
  clima: "Templado Semicálido"
},
"Maravilla Tenejapa": {
  actores: {
    productores: "1,550 familias productoras",
    cooperativas: "4 cooperativas consolidadas con enfoque social y certificación Fair Trade",
    exportacion: "40% de la producción exportada directamente a Europa (café orgánico)",
    ayuntamiento: "Apoyo comunitario en conservación y producción orgánica"
  },
  infoProductores: {
    perfil: "Productores indígenas y colonos con manejo agroforestal",
    promedioFinca: "2 - 5 hectáreas"
  },
  altura: "400 - 1,000 msnm",
  variedades: [
    "Caturra",
    "Catimor",
    "Mundo Novo"
  ],
  produccionHa: "2,050 hectáreas en producción (~1,850 toneladas anuales)",
  clima: "Cálido húmedo con lluvias abundantes todo el año"
},

  "Las Rosas": {
  actores: {
    productores: "1,050 pequeños productores",
    cooperativas: "3 organizaciones principales afiliadas a la Unión de Caficultores de la Selva",
    exportacion: "Principalmente comercialización nacional (exportación indirecta)",
    ayuntamiento: "Organiza ferias regionales y gestiona programas de sanidad vegetal"
  },
  infoProductores: {
    perfil: "Productores minifundistas con fuerte arraigo tradicional",
    promedioFinca: "1.5 - 3 hectáreas"
  },
  altura: "1,200 - 1,600 msnm",
  variedades: [
    "Typica",
    "Bourbon",
    "Marsellesa (15%, resistente a roya)"
  ],
  produccionHa: "1,450 hectáreas sembradas (~2,150 toneladas de café cereza)",
  clima: "Templado subhúmedo con lluvias en verano"
},
"Tzimol": {
  actores: {
    productores: "380 productores independientes",
    cooperativas: "Producción individual con procesos propios de beneficio húmedo",
    exportacion: "Menos del 5% exportado; 95% orientado al mercado nacional de especialidad",
    ayuntamiento: "Impulsa corredor turístico-productivo vinculado a las Cascadas de El Chiflón"
  },
  infoProductores: {
    perfil: "Productores de micro-lotes enfocados en café de especialidad",
    promedioFinca: "Menos de 2 hectáreas (promedio 1.2 ha)"
  },
  altura: "1,100 - 1,500 msnm",
  variedades: [
    "Garnica",
    "Bourbon",
    "Typica"
  ],
  produccionHa: "480 hectáreas (~620 toneladas de grano de alta especialidad)",
  clima: "Semicálido a templado con estación seca marcada"
},



// --- REGIÓN FRAILESCA ---
"Ángel Albino Corzo": {
  actores: {
    productores: "673 productores registrados (Censo SIAP)",
    cooperativas: "Sede de grandes organizaciones como Triunfo Verde y Campesinos Ecológicos",
    exportacion: "Alta exportación a mercados orgánicos y de especialidad",
    ayuntamiento: "Dirección de Fomento Agropecuario"
  },
  infoProductores: {
    perfil: "Pequeños y medianos productores organizados",
    promedioFinca: "2.0 a 4.0 hectáreas"
  },
  altura: "800 - 1,500 msnm",
  variedades: ["Arábica (Caturra, Bourbon, Catimor)", "Resistentes a la Roya"],
  produccionHa: "7,483 hectáreas sembradas",
  clima: "Cálido Subhúmedo / Templado"
},

"La Concordia": {
  actores: {
    productores: "499 productores registrados",
    cooperativas: "Organizaciones locales vinculadas a la Sierra Madre",
    exportacion: "Comercialización nacional y exportación indirecta",
    ayuntamiento: "Oficina de Apoyo al Campo"
  },
  infoProductores: {
    perfil: "Pequeños productores rurales",
    promedioFinca: "1.5 hectáreas"
  },
  altura: "600 - 1,200 msnm",
  variedades: ["Arábica (Mundo Novo, Caturra)"],
  produccionHa: "8,180 hectáreas sembradas",
  clima: "Cálido"
},

"Villa Corzo": {
  actores: {
    productores: "252 productores",
    cooperativas: "Grupos de productores independientes",
    exportacion: "Mercado local y regional",
    ayuntamiento: "Desarrollo Rural"
  },
  infoProductores: {
    perfil: "Productores con parcelas diversificadas",
    promedioFinca: "2.5 hectáreas"
  },
  altura: "600 - 1,300 msnm",
  variedades: ["Arábica (Garnica, Catimor)"],
  produccionHa: "4,520 hectáreas sembradas",
  clima: "Cálido Subhúmedo"
},

"Montecristo de Guerrero": {
  actores: {
    productores: "403 productores registrados",
    cooperativas: "Grupos vinculados a la Reserva de la Biósfera El Triunfo",
    exportacion: "Café de conservación / Especialidad",
    ayuntamiento: "Fomento Municipal"
  },
  infoProductores: {
    perfil: "Pequeños caficultores de montaña",
    promedioFinca: "1.8 hectáreas"
  },
  altura: "1,100 - 1,600 msnm",
  variedades: ["Arábica (Typica, Bourbon, Caturra)"],
  produccionHa: "4,166 hectáreas sembradas",
  clima: "Templado Húmedo"
}
  
};

   this.ngZone.run(() => {
  // Buscamos en nuestro diccionario de datos reales
  const datosReales = DATOS_MUNICIPIOS[nombreMun];

  if (datosReales) {
    // Usamos el operador spread (...) para traer TODA la información 
    // (actores, infoProductores, variedades, produccionHa, etc.) de una sola vez
    this.selectedMunicipio = {
      nombre: nombreMun,
      zona: zona,
      ...datosReales 
    };
  } else {
    // Datos por defecto con la estructura completa para evitar errores en la vista
    this.selectedMunicipio = {
      nombre: nombreMun,
      zona: zona,
      actores: {
        productores: "Dato en proceso",
        cooperativas: "Dato en proceso",
        exportacion: "Dato en proceso",
        ayuntamiento: "Dato en proceso"
      },
      infoProductores: {
        perfil: "No disponible",
        promedioFinca: "No disponible"
      },
      altura: "Dato en proceso",
      variedades: ["No especificado"],
      produccionHa: "Dato en proceso",
      clima: "Variado"
    };
  }
  
  this.cdr.detectChanges();
});

}

  public cargarNivelPais() {
    this.esChiapasVisible = false;
    this.markersGroup.clearLayers();
    if (this.chiapasLayer) this.map.removeLayer(this.chiapasLayer);

    const chiapasGeo = { "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [[[-94.5, 16], [-92, 14.5], [-90, 16], [-91, 18], [-94.5, 18], [-94.5, 16]]] } };
    
    this.chiapasLayer = L.geoJSON(chiapasGeo, {
      style: { color: '#003b6f', weight: 2, fillOpacity: 0.5, fillColor: '#003b6f' },
      onEachFeature: (feature: any, layer: any) => {
        layer.on('click', () => this.ngZone.run(() => this.aislarChiapas()));
      }
    }).addTo(this.map);
  }

  private aislarChiapas() {
    this.esChiapasVisible = true;
    this.markersGroup.clearLayers();
    if (this.chiapasLayer) this.map.removeLayer(this.chiapasLayer);
    
    this.map.flyTo([16.3, -92.4], 8);

    // Contorno del estado
    const contornoChiapas = { "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [[[-93.8, 16.0], [-92.5, 14.5], [-91.5, 15.0], [-90.5, 16.0], [-91.0, 17.5], [-92.5, 18.0], [-94.0, 17.5], [-93.8, 16.0]]] } };
    L.geoJSON(contornoChiapas, { style: { color: '#6F4E37', weight: 2, fillOpacity: 0.05 } }).addTo(this.markersGroup);

    this.cargarZonasIndividuales();
  }

  private cargarZonasIndividuales() {
    // Definición de las 7 zonas con sus municipios reales
    const zonas = [
      { 
      name: "Soconusco", coords: [[14.7, -92.5], [15.2, -92.5], [15.2, -92.0], [14.7, -92.0]], mun: ["Tapachula", "Cacahoatán", "Unión Juárez", "Tuxtla Chico", "Huixtla", "Huehuetán", "Tuzantán"] 
    },
    { 
      name: "Sierra Madre", 
      coords: [
    [15.85, -92.95], // Noroeste (Mazapa)
    [15.75, -92.75],
    [15.70, -92.55],
    [15.65, -92.40],
    [15.55, -92.30],
    [15.40, -92.25], // Frontera Comalapa
    [15.25, -92.30],
    [15.15, -92.45], // Amatenango
    [15.10, -92.65],
    [15.20, -92.85],
    [15.35, -93.00], // El Porvenir
    [15.55, -93.05],
    [15.75, -93.00],
    [15.85, -92.95] ], 
      mun: ["Siltepec", "Motozintla", "El Porvenir", "Mazapa de Madero", "La Grandeza", "Frontera Comalapa", "Amatenango de la Frontera", "Chicomuselo", "Bella Vista", "Bejucal de Ocampo", "Honduras de la Sierra", "Capitán Luis Ángel Vidal"] 
    },
    { 
      name: "Frailesca", 
      coords: [[15.7, -93.1], [16.2, -93.1], [16.2, -92.5], [15.7, -92.5]], 
      mun: ["Ángel Albino Corzo", "La Concordia", "Villa Corzo", "Montecristo de Guerrero"] 
    },
    { 
      name: "Los Altos", 
      coords: [[16.5, -92.8], [17.0, -92.8], [17.0, -92.3], [16.5, -92.3]], 
      mun: ["Chenalhó", "Tenejapa", "Oxchuc", "San Cristóbal de las Casas", "Huixtán", "Pantelhó", "Altamirano"] 
    },
    { 
      name: "Selva", 
      coords: [[16.5, -92.0], [17.5, -92.0], [17.5, -91.0], [16.5, -91.0]], 
      mun: ["Ocosingo", "Yajalón", "Chilón", "Palenque", "Salto de Agua", "Maravilla Tenejapa"] 
    },
    { 
      name: "Norte", 
      coords: [[17.2, -93.3], [17.8, -93.3], [17.8, -92.8], [17.2, -92.8]], 
      mun: ["Pichucalco", "Amatán", "Ixtacomitán", "Solosuchiapa", "Cintalapa"] 
    },
    { 
      name: "Meseta Comiteca", 
      coords: [[15.8, -92.3], [16.4, -92.3], [16.4, -91.5], [15.8, -91.5]], 
      mun: ["Las Margaritas", "La Trinitaria", "Independencia", "Comitán de Domínguez","Las Rosas","Maravilla Tenejapa", "Tzimol" ] 
    }

    ];

    zonas.forEach(z => {
      const data = this.generarDatosReales(z.name, z.mun);
      const poly = L.polygon(z.coords as any, { color: '#6F4E37', weight: 2, fillOpacity: 0.5, fillColor: '#8B4513' }).addTo(this.markersGroup);
      
      poly.bindTooltip(z.name);
      poly.on('click', () => this.ngZone.run(() => { this.selectedRegionData = data; this.cdr.detectChanges(); }));
    });
  }

  private generarDatosReales(nombre: string, municipios: string[]): IRegionalData {
    const stats: any = {
      "Soconusco": { alt: "600-1600", prom: 1100, prod: "185,000", var: ["Typica", "Bourbon", "Maragogype", "Caturra"], p: 18500 },
      "Sierra Madre": { alt: "900-1900", prom: 1450, prod: "215,000", var: ["Caturra", "Geisha", "Bourbon", "Garnica"], p: 22000 },
      "Los Altos": { alt: "1200-1950", prom: 1580, prod: "145,000", var: ["Mundo Novo", "Typica Criollo", "Bourbon"], p: 35000 },
      "Frailesca": { alt: "800-1550", prom: 1250, prod: "135,000", var: ["Catimor", "Sarchimor", "Caturra"], p: 14000 },
      "Selva": { alt: "600-1400", prom: 980, prod: "120,000", var: ["Bourbon", "Oro Azteca", "Typica"], p: 28000 },
      "Norte": { alt: "400-1200", prom: 850, prod: "95,000", var: ["Robusta", "Costa Rica", "Oro Azteca"], p: 12000 },
      "Meseta Comiteca": { alt: "1000-1650", prom: 1350, prod: "85,000", var: ["Garnica", "Caturra", "Bourbon"], p: 9500 }
    };

    const s = stats[nombre];
    return {
      nombreRegion: nombre,
      municipios: municipios,
      actoresDetalle: { productores: s.p, cooperativas: 35, acopiadores: 15, exportadores: 10, tostadores: 12, proveedores: 20, ayuntamientos: municipios.length },
      productoresPorTamano: { small: Math.floor(s.p * 0.9), medium: Math.floor(s.p * 0.08), large: Math.floor(s.p * 0.02), promedioSuperficie: "3.5 ha" },
      rangoAltitudinal: s.alt + " msnm",
      altitudPromedio: s.prom,
      variedadesPredominantes: s.var,
      produccionEstimada: 'Alta',
      totalProduccion: s.prod + ' Quintales oro/año'
    };
  }

  public resetMapa() { this.cargarNivelPais(); this.map.setView([23.6, -102.5], 5); }

  public generateReport() {
    if (!this.selectedRegionData) return;
    const d = this.selectedRegionData;
    const doc = new jsPDF();
    doc.setFillColor(0, 59, 111);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`REPORTE REGIONAL: ${d.nombreRegion}`, 15, 25);
    autoTable(doc, {
        startY: 50,
        head: [['Concepto', 'Información']],
        body: [
            ['Municipios', d.municipios.join(', ')],
            ['Producción', d.totalProduccion],
            ['Variedades', d.variedadesPredominantes.join(', ')],
            ['Altura Media', d.altitudPromedio + ' msnm']
        ],
        headStyles: { fillColor: [0, 59, 111] }
    });
    doc.save(`Reporte_Cafe_${d.nombreRegion}.pdf`);
  }

  applyFilters() { if(this.esChiapasVisible) this.aislarChiapas(); }
}