import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// Interfaces para mantener el tipado fuerte que tenías

type TipoCafe = 'grano' | 'tostado' | 'soluble';

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

  private geoJsonLayer: any = null;

public datosChiapas: any = {};
public datosMundo: any[] = [];
public datosNacionales: any = {};

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

  private coffeeData: any;
 

  // --- DATA DE LOS 36 PUNTOS ---


  constructor(
    private http: HttpClient,
     private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
this.http.get('assets/data/indicadores-cafe.json').subscribe((data: any) => {
  this.datosMundo = data.mundo.indicadores;
  this.datosNacionales = data.nacional;
  this.datosChiapas = data.chiapas; //  FALTABA
});

  this.http.get('assets/data/coffee-data.json').subscribe(data => {
    this.coffeeData = data;
  });
}
async ngAfterViewInit() {
  if (isPlatformBrowser(this.platformId)) {
    const leafletModule = await import('leaflet');
    L = leafletModule.default || leafletModule;

    // pequeño delay para asegurar DOM limpio
    setTimeout(() => {
      this.initMap();
    }, 100);
  }
}

public getListaActiva() {
  if (this.seccionActiva === 'mundo') return this.datosMundo;

  if (this.seccionActiva === 'estado') {
    return this.datosChiapas[this.subSeccion] || [];
  }

  if (this.seccionActiva === 'nacional') {
    return this.datosNacionales[this.subSeccion] || [];
  }

  return [];
}

  private initMap() {
  if (!L) return;

  //  DESTRUIR mapa anterior si existe
  if (this.map) {
    this.map.off();
    this.map.remove();
    this.map = null;
  }

  // RESET estado SIEMPRE al entrar
  this.seccionActiva = 'mundo';
  this.selectedRegionData = null;

  // Crear mapa limpio
  this.map = L.map('map-container', {
    center: [20, 10],
    zoom: 2
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

  this.markersGroup = L.layerGroup().addTo(this.map);

  this.irSeccion('mundo');
}

ngOnDestroy() {
  if (this.map) {
    this.map.off();
    this.map.remove();
    this.map = null;
  }
}

  // --- LÓGICA DE NAVEGACIÓN ---
public irSeccion(seccion: string) {
  if (!this.map || !this.coffeeData) return;

  this.seccionActiva = seccion;
  this.markersGroup?.clearLayers();

  if (seccion === 'mundo') {
    this.map.flyTo([20, 10], 2);
    this.renderizarMundo();

  } else if (seccion === 'nacional') {
    this.map.flyTo([23.6, -102.5], 5);
    this.renderizarEstados(); //  AQUÍ ESTÁ LA CLAVE

  } else if (seccion === 'estado') {
    this.map.flyTo([23.6, -102.5], 5);
    this.renderizarEstados();
  }
}

  private renderizarMundo() {
    this.coffeeData.rankingMundial.forEach((p: any) => {
      const marker = L.circleMarker(p.coords, { radius: 8, fillColor: p.color, color: '#fff', fillOpacity: 0.9 })
        .addTo(this.markersGroup);
      
      // Ranking y nombre siempre visibles
      marker.bindTooltip(`${p.pos}. ${p.nombre}`, { 
        permanent: true, 
        direction: 'right', 
        className: 'etiqueta-mapa' 
      });
    });
  }

private renderizarEstados() {
  this.markersGroup?.clearLayers();

  this.http.get('assets/data/mexico-estados.geojson.json').subscribe((geo: any) => {

    if (this.chiapasLayer) {
      this.map.removeLayer(this.chiapasLayer);
    }

    this.chiapasLayer = L.geoJSON(geo, {
      style: (feature: any) => {
        const estado = feature.properties.name;
        const prod = this.coffeeData.estadosMexico[estado]?.prod;

        return {
          fillColor: this.getColorEstado(prod),
          weight: 1,
          color: '#fff',
          fillOpacity: 0.7
        };
      },

      onEachFeature: (feature: any, layer: any) => {
        const estado = feature.properties.name;
        const info = this.coffeeData.estadosMexico[estado];

        if (info) {
          layer.bindTooltip(`${estado}: ${info.prod}`, {
            permanent: true,
            direction: 'center',
            className: 'etiqueta-mapa'
          });

          layer.on('click', () => {
            this.ngZone.run(() => {
              this.cargarEstado(estado, info);
            });
          });
        }
      }
    }).addTo(this.map);
  });
}
getColorEstado(prod: string) {
  if (!prod) return '#ccc';

  const val = parseFloat(prod);

  if (val >= 30) return '#4b2e2b';
  if (val >= 20) return '#6F4E37';
  if (val >= 10) return '#a67c52';
  return '#d2b48c';
}
private cargarEstado(nombre: string, info: any) {
  this.selectedRegionData = {
    nombreRegion: nombre,
    totalProduccion: info.ton + " Ton",
    actoresDetalle: {
      productores: info.productores,
      clima: info.clima
    },
    municipios: ["Zona cafetalera", "Región alta", "Región media"]
  } as any;
}

  // Función para el botón de regresar
public regresarMenu() {
  this.router.navigate(['/home']);
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

  if (this.chart) {
    this.chart.destroy();
  }

  const indicador = this.itemSeleccionado;

  if (!indicador) return;

  let labels: number[] = [];
  let datasets: any[] = [];

  // CASO CON DESGLOSE
  if (indicador.tieneDesglose) {
  const colores: any = {
  grano: '#4b2e2b',
  tostado: '#c08457',
  soluble: '#f59e0b'
};

const tipos: TipoCafe[] = ['grano', 'tostado', 'soluble'];

const base = indicador.serie[tipos[0]] || [];
labels = base.map((d: any) => d.anio);

   tipos.forEach(tipo => {
  if (this.filtrosTipo[tipo] && indicador.serie[tipo]) {

    const dataFiltrada = indicador.serie[tipo]
      .filter((d: any) => d.anio >= this.filtroAnios.inicio && d.anio <= this.filtroAnios.fin);

    datasets.push({
      label: tipo.toUpperCase(),
      data: dataFiltrada.map((d: any) => d.valor),
      backgroundColor: colores[tipo],
      borderColor: colores[tipo]
    });
  }
});

  } else {
    const dataFiltrada = indicador.serie
      .filter((d: any) => d.anio >= this.filtroAnios.inicio && d.anio <= this.filtroAnios.fin);

    labels = dataFiltrada.map((d: any) => d.anio);

    datasets.push({
  label: indicador.label,
  data: dataFiltrada.map((d: any) => d.valor),
  borderColor: '#f59e0b',
  backgroundColor: 'rgba(245, 158, 11, 0.2)',
  tension: 0.4,
  fill: true
});
  }


  this.chart = new Chart(ctx, {
    type: indicador.tieneDesglose ? 'bar' : 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false
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
