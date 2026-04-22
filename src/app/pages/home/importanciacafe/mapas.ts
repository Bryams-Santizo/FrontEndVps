import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Interfaces para mantener el tipado fuerte que tenías
interface IMunicipioData {
  nombre: string; zona: string; actores: any; infoProductores: any;
  altura: string; variedades: string[]; produccionHa: string; clima: string;
}

interface IRegionData {
  nombreRegion: string; municipios: string[]; actoresDetalle: any;
  productoresPorTamano: any; rangoAltitudinal: string; altitudPromedio: number;
  variedadesPredominantes: string[]; produccionEstimada: string; totalProduccion: string;
}

let L: any = null;



@Component({
  selector: 'app-mapas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './mapas.html',
  styleUrls: ['./mapas.css']
})
export class mapas implements OnInit, AfterViewInit {
  private map: any;
  private markersGroup: any = null;
  private chiapasLayer: any = null;

  // ESTADOS DE NAVEGACIÓN
  public seccionActiva: string = 'mundo';
  public subSeccion: string = 'produccion';

  // --- VARIABLES PARA EL MODAL DE GRÁFICOS ---
  public itemSeleccionado: any = null;
  public filtroAnios = { inicio: 2000, fin: 2024 };
  public chart: any;
  public filtrosTipo = { grano: true, tostado: true, soluble: true };
  
  // DATOS SELECCIONADOS (MAPA)
  public selectedMunicipio: IMunicipioData | null = null;
  public selectedRegionData: IRegionData | null = null;

  // --- DATA DE LOS 36 PUNTOS ---
 public datosMundo = [
  { label: 'Posición en el ranking mundial', valor: '9° Lugar' },
  { label: 'Producción Nacional', valor: '4.5M' },
  { label: '% Producción Mundial', valor: '2.8%' },
  { label: 'Valor de la producción nacional', valor: '$480M USD' },
  // Agregamos la bandera 'tieneDesglose'
  { label: 'Valor Exportaciones', valor: '$480M USD', tieneDesglose: true },
  { label: 'Valor de las exportaciones como proporción del comercio mundial', valor: '$480M USD' },
  { label: 'Valor de las importaciones', valor: '$120M USD', tieneDesglose: true },
  { label: 'Valor de las importaciones como proporción del comercio mundial', valor: '$480M USD' },
  { label: 'Valor por variedades exportadas', valor: 'Ver detalle', tieneDesglose: true },
];

  public datosNacionales = {
    produccion: [
  { label: 'Superficie Sembrada', valor: '712,148 ha' },
  { label: 'Superficie cosechada (ha)', valor: '642,500 ha' }, 
  { label: 'Producción total (ton)', valor: '248,300 ton' }, // Equivalente a aprox. 4.1M de sacos
  { label: 'Valor de producción ($)', valor: '$19,250M MXN' },
  { label: 'Rendimiento ton/ha', valor: '0.39 ton/ha' }, // Rendimiento promedio nacional de café pergamino
],
   estructura: [
  { label: 'Unidades de Producción', valor: '515,000' },
  { label: 'Superficie promedio/productor', valor: '1.3 ha' },
  { label: 'Variedades Arábica', valor: '94%' }, // El 6% restante es Robusta
  { label: 'Tamaño promedio de parcela', valor: '1.2 ha' }, 
  { label: 'Sistemas productivos predominantes', valor: 'Bajo Sombra' },
  { label: 'Altitud productiva predominante', valor: '900 - 1,200 msnm' },
  { label: 'Tipo de cafetal %', valor: '95% Tradicional' },
  { label: 'Edad promedio de las plantaciones', valor: '18 - 22 años' },
  { label: 'Precio medio rural ($/ton)', valor: '$75,400 MXN' }, // Estimado para café pergamino
  { label: 'Producción por productor', valor: '480 kg/año' },
  { label: 'Producción vendida como', valor: 'Café Pergamino' }
],
    socio: [
  { label: 'Población total', valor: '515,000 productores' }, // Unidades de producción estimadas
  { label: 'Población rural (%)', valor: '98%' }, // La caficultura es casi totalmente rural
  { label: 'Población en edad productiva (15-64 años)', valor: '62%' },
  { label: 'PEA (Población Económicamente Activa)', valor: '50.2%' }, // Dato general sector primario 2025
  { label: 'Tasa de dependencia', valor: '3.8 personas/hogar' },
  { label: 'Tasa de migración (expulsión/recepción)', valor: 'Alta (hasta 20% en zonas críticas)' }, //
  { label: 'Ingreso promedio por hogar', valor: '$2,100 MXN mensuales' }, // Basado en $106 USD promedio productor
  { label: '% población en pobreza', valor: '75%' }, // Estimación en zonas serranas cafetaleras
  { label: '% pobreza extrema', valor: '32%' }, // Concentrada en zonas indígenas de Chiapas y Oaxaca
  { label: 'Familias dependientes', valor: '3 millones de personas' } // Impacto indirecto total
]
  };

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
   
  }

  // --- LÓGICA DE NAVEGACIÓN ---
 // --- LÓGICA DE NAVEGACIÓN CORREGIDA ---
public irSeccion(seccion: string) {
  this.seccionActiva = seccion;
  this.selectedRegionData = null; 
  this.markersGroup?.clearLayers(); 

  if (seccion === 'mundo') {
    this.map.flyTo([20, 10], 2);
    this.dibujarPuntos(this.puntosMundo); // <--- AHORA SÍ DIBUJA LOS PUNTOS DEL MUNDO
  } 
  else if (seccion === 'nacional') {
    this.map.flyTo([23.6, -102.5], 5);
    // En nacional no dibujamos puntos para que se vea limpio el mapa
  } 
  else if (seccion === 'estado') {
    this.map.flyTo([17.5, -96], 6); 
    this.dibujarPuntos(this.puntosNacionales);
  }
}

private dibujarPuntos(listaPuntos: any[]) {
  if (!L || !this.markersGroup) return;

  listaPuntos.forEach(p => {
    const marker = L.circleMarker(p.coords, {
      radius: this.seccionActiva === 'mundo' ? 6 : 9, // Puntos más pequeños en el mundo
      fillColor: p.color,
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).addTo(this.markersGroup);

    marker.bindTooltip(`<b>${p.nombre}</b>`, { direction: 'top' });

    marker.on('click', () => {
      this.ngZone.run(() => {
        if (this.seccionActiva === 'mundo') {
          // Si es mundo, quizás solo quieras mostrar información básica
          console.log("País seleccionado:", p.nombre);
        } else {
          // Si es estado, cargamos la estructura completa
          this.selectedRegionData = { 
            nombreRegion: p.nombre, 
            municipios: ['Municipio X', 'Municipio Y'],
            actoresDetalle: { productores: 15420, cooperativas: 12, exportadores: 8 },
            totalProduccion: '45,000 Ton',
            // ... rellena con los datos que quieras que aparezcan
          } as any;
        }
      });
    });
  });
}

  public getListaActiva() {
    if (this.seccionActiva === 'mundo') return this.datosMundo;
    return (this.datosNacionales as any)[this.subSeccion];
  }

// --- // --- LÓGICA DEL MAPA (Leaflet) ------

private puntosNacionales = [
  { nombre: 'Chiapas', coords: [16.75, -92.67], color: 'red', info: 'Líder en producción orgánica' },
  { nombre: 'Veracruz', coords: [19.17, -96.13], color: '#6F4E37', info: 'Cafés de alta acidez' },
  { nombre: 'Oaxaca', coords: [17.07, -96.72], color: '#6F4E37', info: 'Producción en zonas indígenas' },
  { nombre: 'Puebla', coords: [19.04, -98.20], color: '#6F4E37', info: 'Gran altitud productiva' },
  { nombre: 'Guerrero', coords: [17.55, -99.50], color: '#6F4E37', info: 'Café de especialidad' }
];

private puntosMundo = [
  { nombre: 'México', coords: [23.6, -102.5], color: 'green' },
  { nombre: 'Brasil', coords: [-14.23, -51.92], color: '#6F4E37' },
  { nombre: 'Colombia', coords: [4.57, -74.29], color: '#6F4E37' },
  { nombre: 'Etiopía', coords: [9.14, 40.48], color: '#6F4E37' },
  { nombre: 'Vietnam', coords: [14.05, 108.27], color: '#6F4E37' }
];




  // --- LÓGICA DEL MAPA (Leaflet) ---
  

  

  

  public resetMapa() {
    this.map.flyTo([23.6, -102.5], 5);
  }

 verGrafico(item: any) {
  this.itemSeleccionado = item;
  
  // Esperamos un momento a que el modal se abra para que el Canvas exista en el DOM
  setTimeout(() => {
    this.generarGrafico();
  }, 300);
}

generarGrafico() {
  const ctx = document.getElementById('miGraficoCanvas') as HTMLCanvasElement;
  
  // Si ya existe un gráfico, lo destruimos para crear uno nuevo
  if (this.chart) {
    this.chart.destroy();
  }

  // Datos de prueba (Aquí conectarías con tu lógica de años)
  const etiquetasAnios = Array.from({length: (this.filtroAnios.fin - this.filtroAnios.inicio + 1)}, (_, i) => this.filtroAnios.inicio + i);

  this.chart = new Chart(ctx, {
    type: this.itemSeleccionado.tieneDesglose ? 'bar' : 'line',
    data: {
      labels: etiquetasAnios,
      datasets: this.itemSeleccionado.tieneDesglose ? [
        { label: 'Grano', data: etiquetasAnios.map(() => Math.random() * 100), backgroundColor: '#4b3832' },
        { label: 'Tostado', data: etiquetasAnios.map(() => Math.random() * 50), backgroundColor: '#855e42' },
        { label: 'Soluble', data: etiquetasAnios.map(() => Math.random() * 30), backgroundColor: '#c0a48c' }
      ] : [
        { label: this.itemSeleccionado.label, data: etiquetasAnios.map(() => Math.random() * 100), borderColor: '#ffc107', tension: 0.1 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: '#444' } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { labels: { color: 'white' } }
      }
    }
  });
}
  public actualizarGrafico() {
    console.log("Actualizando gráfico de:", this.itemSeleccionado?.label);
    console.log("Rango:", this.filtroAnios.inicio, "-", this.filtroAnios.fin);
    console.log("Filtros de tipo:", this.filtrosTipo);
    
    // Aquí iría la lógica para llamar a tu API o filtrar tu JSON local
    // y redibujar el canvas del gráfico.
    alert(`Actualizando datos de ${this.itemSeleccionado?.label} para el periodo ${this.filtroAnios.inicio}-${this.filtroAnios.fin}`);
  }

  public seleccionarMunicipio(m: string, r: string) {
    this.selectedMunicipio = {
      nombre: m, zona: r, altura: '1200 msnm', clima: 'Húmedo',
      produccionHa: '1.2 ton', variedades: ['Typica'],
      actores: { productores: '50', cooperativas: '2', exportacion: 'Sí', ayuntamiento: 'Si' },
      infoProductores: { perfil: 'Pequeño', promedioFinca: '2 ha' }
    };
  }

  public generateReport() {
    alert('Generando PDF...');
  }

// 1. Agregar esta función para obtener el valor específico del estado
public getValorEstado(label: string): string {
  if (!this.selectedRegionData) return '—';
  
  // Aquí mapeamos los labels de la lista general a las propiedades del objeto del estado
  // Si en el futuro tienes un JSON con datos reales por estado, aquí haces el match
  const mapaDatos: any = {
    'Producción total (ton)': this.selectedRegionData.totalProduccion,
    'Superficie Sembrada': 'Dato por estado...',
    'Rendimiento ton/ha': '0.85', // Ejemplo
    'Unidades de Producción': this.selectedRegionData.actoresDetalle?.productores || '—'
  };

  return mapaDatos[label] || 'Consultando...';
}


}
