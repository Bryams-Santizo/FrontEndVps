import { AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

//  CHART
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-globo-cafetalero',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class mundo implements AfterViewInit, OnDestroy, OnInit {

  // =============================
  // 🔹 ESTADOS
  // =============================
  selectedMarket: string = 'internacional';
  selectedSegment: any = null;
  selectedNiche: any = null;
  selectedLocation: string | null = null;
  locationData: any = {};
  activeTab: string = 'caracteristicas';

  // =============================
  //  DATA
  // =============================
  segmentsData: any[] = [];
  technicalData: any[] = [];
  locationsData: any = {};

  // =============================
  //  GLOBO
  // =============================
  private globe: any;
  private worldFeatures: any[] = [];
  private mexicoFeatures: any[] = [];

  //  CHART
  private chart: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  // =============================
  //  INIT
  // =============================
  ngOnInit(): void {
    this.loadJSONs();
  }

  loadJSONs() {
    this.http.get('assets/data/segments.json')
      .subscribe((data: any) => this.segmentsData = data.segments);

    this.http.get('assets/data/technical-structure.json')
      .subscribe((data: any) => this.technicalData = data);

    this.http.get('assets/data/locations.json')
      .subscribe((data: any) => this.locationsData = data);
  }

  // =============================
  //  INTERACCIONES
  // =============================
  selectSegment(segment: any) {
    this.selectedSegment = segment;
    this.selectedNiche = null;
    this.selectedLocation = null;
    this.destroyChart();
    this.applyHighlight(segment);
  }

  selectLocation(loc: string) {
    this.selectedLocation = loc;
    this.locationData = this.locationsData[this.selectedMarket]?.[loc] || {};

    //  GENERAR GRAFICA
    this.createChart();
  }

  setMarket(type: string) {
    this.selectedMarket = type;
    this.selectedSegment = null;
    this.selectedLocation = null;
    this.destroyChart();

    if (!this.globe) return;

    if (type === 'nacional') {
      this.globe.polygonsData(this.mexicoFeatures);
      this.globe.pointOfView({ lat: 23.5, lng: -102, altitude: 1.8 }, 1200);
    } else {
      this.globe.polygonsData(this.worldFeatures);
      this.globe.pointOfView({ lat: 15, lng: -40, altitude: 2.5 }, 1200);
    }

    this.resetStyles();
  }

  // =============================
  //  GRAFICA
  // =============================
 

  destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  // =============================
  //  GLOBO
  // =============================
  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const GlobeModule = await import('globe.gl');
    const Globe = GlobeModule.default;

    const container = document.getElementById('coffee-globe');
    if (!container) return;

    this.globe = new Globe(container)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#1a3c6d')
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .polygonStrokeColor(() => '#ffd700')
      .polygonCapColor(() => 'rgba(255,255,255,0.2)')
      .polygonSideColor(() => 'rgba(26,60,109,0.3)')
      .polygonLabel((f: any) => `
        <div style="background:#1a3c6d;color:white;padding:8px;border:1px solid gold;border-radius:4px;">
          <b>${f.properties.name || f.properties.ADMIN}</b>
        </div>
      `);

    try {
      const [world, mexico] = await Promise.all([
        fetch('https://unpkg.com/world-atlas@2/countries-110m.json'),
        fetch('https://raw.githubusercontent.com/angelnmara/geojson/master/mexicoHigh.json')
      ]);

      const worldRaw = await world.json();
      const topojson = await import('topojson-client');

      this.worldFeatures = (topojson.feature(worldRaw, worldRaw.objects.countries) as any).features;

      const mexicoRaw = await mexico.json();
      this.mexicoFeatures = mexicoRaw.features;

      this.setMarket('internacional');

    } catch (e) {
      console.error('Error cargando mapas', e);
    }
  }

  applyHighlight(data: any) {
    if (!this.globe) return;

    const targets = this.selectedMarket === 'nacional'
      ? data.estados || []
      : data.paises || [];

    const lower = targets.map((t: string) => t.toLowerCase());

    this.globe.polygonCapColor((f: any) => {
      const name = (f.properties.name || f.properties.ADMIN || '').toLowerCase();
      return lower.includes(name) ? '#ffd700' : 'rgba(255,255,255,0.15)';
    });

    this.globe.polygonAltitude((f: any) => {
      const name = (f.properties.name || f.properties.ADMIN || '').toLowerCase();
      return lower.includes(name) ? 0.06 : 0.01;
    });
  }

  resetStyles() {
    if (!this.globe) return;
    this.globe.polygonCapColor(() => 'rgba(255,255,255,0.2)');
    this.globe.polygonAltitude(0.01);
  }

  ngOnDestroy() {
    this.destroyChart();
  }
createChart() {
  if (!isPlatformBrowser(this.platformId)) return;

  const canvas: any = document.getElementById('marketChart');
  if (!canvas) return;

  this.destroyChart();

  //  SI NO HAY DATA → NO GRAFICA
  if (!this.locationData) return;

  //  DATOS DINÁMICOS DESDE JSON
  const dataValues = this.selectedMarket === 'nacional'
    ? [
        this.locationData.demanda || 50,
        this.locationData.precioNivel || 50,
        this.locationData.acceso || 50,
        this.locationData.competenciaNivel || 50
      ]
    : [
        this.locationData.demanda || 60,
        this.locationData.precioNivel || 60,
        this.locationData.acceso || 60,
        this.locationData.competenciaNivel || 60
      ];

  this.chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Demanda', 'Precio', 'Acceso', 'Competencia'],
      datasets: [{
        label: 'Indicadores de Mercado',
        data: dataValues
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      },
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}
  // Obtener nichos por segmento
getNichesForSegment(segmentId: string) {
  if (!this.technicalData || this.technicalData.length === 0) return [];

  const segment = this.technicalData.find((s: any) => s.id === segmentId);

  return segment?.nichos || [];
}

// Seleccionar nicho
selectNiche(niche: any) {
  this.selectedNiche = niche;

  // Opcional: puedes actualizar gráfica o info aquí
  console.log('Nicho seleccionado:', niche);
}
}
