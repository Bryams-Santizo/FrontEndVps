import { AfterViewInit, Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-globo-cafetalero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class mundo implements AfterViewInit, OnDestroy {
  selectedMarket: string = 'internacional';
  selectedSegment: any = null;
  selectedNiche: any = null;
  selectedMarketType: any = null; // Declarada para compatibilidad con tus métodos antiguos
  
  private globe: any;
  private worldFeatures: any[] = [];
private mexicoFeatures: any[] = [];

  // 1. SEGMENTOS PRINCIPALES
 segmentsData = [
    {
      id: 'especialidad',
      nombre: 'Mercado de Especialidad',
      descripcion: 'Café con 84+ puntos SCA, cero defectos primarios y trazabilidad total.',
      estados: ['Ciudad de México', 'Jalisco', 'Baja California', 'Chiapas', 'Oaxaca'],
      paises: ['South Korea', 'Norway', 'Sweden', 'United States of America', 'Taiwan'],
      indicadores: { 
        volumen: 'Microlotes', 
        precio: 'Bolsa NY + Prima ($1.00 - $4.00 USD/lb)', 
        dominio: 'Tostadores/Importadores Especializados', 
        entrada: 'Puntaje SCA 84+, Humedad 10-12%' 
      },
      detallesExtendidos: {
        logistica: 'Bolsas GrainPro en sacos de yute. Consumo mensual/bimestral.',
        normativa: 'Nacional: NOM-149-SCFI | Int: FDA (EEUU) y EUDR (Europa).',
        consumidor: 'Alto poder adquisitivo, educado en cultura de café y métodos de filtrado.'
      }
    },
    {
      id: 'premium',
      nombre: 'Mercado Premium',
      descripcion: 'Puntaje SCA 80-83. Taza limpia y balanceada para consumo masivo de alta calidad.',
      estados: ['Ciudad de México', 'Estado de México', 'Querétaro', 'Quintana Roo'],
      paises: ['Japan', 'United States of America', 'Italy', 'Spain'],
      indicadores: { 
        volumen: 'Contenedores Consolidados', 
        precio: 'Bolsa NY + Diferencial (+$20 a +$50 USD/saco)', 
        dominio: 'Cadenas regionales / HORECA', 
        entrada: 'Grado 1 o 2, <12 defectos secundarios' 
      },
      detallesExtendidos: {
        logistica: 'FCL (Full Container Load). Recomendado GrainPro.',
        normativa: 'Estricto control de LMR (Límites de Residuos Químicos) en Japón/UE.',
        consumidor: 'Busca sabor familiar de alta calidad y consistencia en el perfil.'
      }
    },
    {
      id: 'certificado',
      nombre: 'Mercado Certificado',
      descripcion: 'Valor basado en cumplimiento ético, social y ambiental (Orgánico, Fairtrade).',
      estados: ['Ciudad de México', 'Baja California', 'Jalisco', 'Chiapas'],
      paises: ['Germany', 'Netherlands', 'Belgium', 'Canada'],
      indicadores: { 
        volumen: 'Medio / Cooperativas', 
        precio: 'Bolsa NY + Primas Fijas Acumulables', 
        dominio: 'Importadores Éticos', 
        entrada: 'Auditoría Anual, Geolocalización (EUDR)' 
      },
      detallesExtendidos: {
        logistica: 'Separación física estricta para evitar contaminación cruzada.',
        normativa: 'Certificado digital trazable obligatorio para aduana europea.',
        consumidor: 'Prioriza el impacto social y ambiental sobre el perfil sensorial.'
      }
    },
    {
      id: 'volumen',
      nombre: 'Mercado de Volumen',
      descripcion: 'Enfocado en consumo masivo, industria de solubles y mezclas comerciales.',
      estados: ['Estado de México', 'Veracruz', 'Chiapas', 'Puebla'],
      paises: ['Belgium', 'United States of America', 'Germany'],
      indicadores: { 
        volumen: 'Masivo / Escala', 
        precio: 'Referencia directa Contrato C (Bolsa NY)', 
        dominio: 'Grandes Traders / Industria', 
        entrada: 'Humedad máx 12%, Grado 3-5' 
      },
      detallesExtendidos: {
        logistica: 'Sacos de yute tradicionales. Eficiencia de costos por kilo.',
        normativa: 'Certificados fitosanitarios básicos y contratos GCA/NCA.',
        consumidor: 'Sensible al precio, consumo de café molido o instantáneo.'
      }
    },
    {
      id: 'valor-agregado',
      nombre: 'Mercado de Valor Agregado',
      descripcion: 'Procesos disruptivos (Honey, Anaeróbicos) o producto terminado (Tostado en origen).',
      estados: ['Nuevo León', 'Jalisco', 'Ciudad de México', 'Puebla'],
      paises: ['Taiwan', 'United Arab Emirates', 'China'],
      indicadores: { 
        volumen: 'Nicho / B2C', 
        precio: 'Costo de Producción + Margen de Marca', 
        dominio: 'E-commerce / Tiendas Gourmet', 
        entrada: 'Registro Marca, Tabla Nutricional, pH/Brix' 
      },
      detallesExtendidos: {
        logistica: 'Empaque con válvula desgasificadora y diseño de alta calidad.',
        normativa: 'Etiquetado en idioma destino y cumplimiento COFEPRIS/FDA.',
        consumidor: 'Buscador de experiencias, valora el diseño y la innovación.'
      }
    }
  ];

  // 2. NICHOS DE ALTO VALOR
  nichesData = [
    {
      nombre: 'Café de Especialidad (Micro-lotes)',
      segmentoRef: 'especialidad',
      detalles: 'Alto margen potencial, exportación directa.',
      paises: ['Japan', 'United States of America', 'Norway'],
      estados: ['Chiapas', 'Oaxaca']
    },
    {
      nombre: 'Café Orgánico Certificado',
      segmentoRef: 'certificado',
      detalles: 'Enfoque en sostenibilidad y salud.',
      paises: ['Germany', 'Canada', 'Netherlands'],
      estados: ['Chiapas', 'Guerrero']
    },
    {
      nombre: 'Cafeterías de Especialidad (RTD)',
      segmentoRef: 'premium',
      detalles: 'Mercado interno, marca propia Chiapas.',
      paises: ['Mexico'],
      estados: ['Ciudad de México', 'Jalisco', 'Chiapas']
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // LÓGICA DE SELECCIÓN
  selectSegment(segment: any) {
    this.selectedSegment = segment;
    this.selectedNiche = null; 
    this.applyHighlight(segment);
  }

  selectNiche(niche: any) {
    this.selectedNiche = niche;
    this.applyHighlight(niche);
  }

  getNichesForSegment(segmentId: string) {
    return this.nichesData.filter(n => n.segmentoRef === segmentId);
  }

  private applyHighlight(data: any) {
  if (!this.globe || !data) return;

  // Determinamos qué lista de nombres buscar
  const targets = this.selectedMarket === 'nacional' 
    ? (data.estados || []) 
    : (data.paises || []);

  this.globe.polygonCapColor((f: any) => {
    // Extraemos el nombre del polígono (name para estados, ADMIN para países)
    const geoName = (f.properties.name || f.properties.ADMIN || '').toLowerCase().trim();
    
    // Verificamos si el nombre está en nuestra lista de objetivos
    const isMatch = targets.some((t: string) => t.toLowerCase().trim() === geoName);
    
    if (isMatch) return '#ffd700'; // Amarillo para los seleccionados
    
    // Si no hay match, color semitransparente
    return 'rgba(255, 255, 255, 0.15)';
  });

  this.globe.polygonAltitude((f: any) => {
    const geoName = (f.properties.name || f.properties.ADMIN || '').toLowerCase().trim();
    const isMatch = targets.some((t: string) => t.toLowerCase().trim() === geoName);
    return isMatch ? 0.06 : 0.01; // Elevación sutil para resaltar
  });
}

  // CONFIGURACIÓN DEL GLOBO
  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const GlobeModule = await import('globe.gl');
    const Globe = GlobeModule.default;
    const container = document.getElementById('coffee-globe');
    if (!container) return;

    this.globe = new Globe(container)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#ffffff')
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .polygonStrokeColor(() => '#ffd700')
      .polygonCapColor(() => 'rgba(255, 255, 255, 0.2)')
      .polygonSideColor(() => 'rgba(26, 60, 109, 0.1)')
      .polygonLabel((f: any) => `
          <div style="background: #1a3c6d; color: white; padding: 8px; border: 1px solid #ffd700; border-radius: 5px;">
            <b style="color: #ffd700;">${f.properties.name || f.properties.ADMIN}</b>
          </div>
        `);

   // REEMPLAZA TU BLOQUE try { ... } ACTUAL CON ESTE:
try {
  // 1. Cargar Mapa Mundial
  const resWorld = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json');
  const worldRaw = await resWorld.json();
  const topojson = await import('topojson-client');
  this.worldFeatures = (topojson.feature(worldRaw, worldRaw.objects.countries) as any).features;

  // 2. NUEVO: Cargar Mapa Detallado de México (Estados reales)
 const resMexico = await fetch('https://raw.githubusercontent.com/angelnmara/geojson/master/mexicoHigh.json');
  const mexicoRaw = await resMexico.json();
  this.mexicoFeatures = mexicoRaw.features;

  // 3. Iniciar el globo
  this.setMarket('internacional');

  window.addEventListener('resize', () => {
    if (this.globe) {
      this.globe.width(container.clientWidth).height(container.clientHeight);
    }
  });
} catch (err) {
  console.error("Error cargando mapas:", err);
}
  }

  setMarket(type: string) {
  this.selectedMarket = type;
  this.selectedSegment = null;
  this.selectedNiche = null;
  
  if (!this.globe) return;

  if (type === 'nacional') {
    // Forzamos la carga exclusiva de los estados de México
    this.globe.polygonsData(this.mexicoFeatures);
    // Ajuste de cámara para ver México de frente
    this.globe.pointOfView({ lat: 23.5, lng: -102, altitude: 1.8 }, 1500);
  } else {
    this.globe.polygonsData(this.worldFeatures);
    this.globe.pointOfView({ lat: 15, lng: -40, altitude: 2.5 }, 1500);
  }
  
  // Resetear estilos inmediatamente para que no se vea blanco o amarillo total
  this.resetStyles();
}

  private resetStyles() {
  if (!this.globe) return;
  // Color base para todos los polígonos cuando no hay nada seleccionado
  this.globe.polygonCapColor(() => 'rgba(255, 255, 255, 0.2)');
  this.globe.polygonAltitude(0.01);
  this.globe.polygonStrokeColor(() => '#ffd700');
}

  ngOnDestroy() {}
}
