import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { PanelComponent } from './pages/panel/panel';
import { CoordinadorComponent } from './pages/coordinador/coordinador';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },

  // 🔹 Ruta del panel del administrador
 {
  path: 'panel',
  component: PanelComponent,
  canActivate: [AuthGuard],
  children: [
    {
      path: 'Rparticipantes',
      loadComponent: () =>
        import('./pages/panel/gestiones/participantes/participantes')
          .then(m => m.ParticipantesComponent)
    },

     {
      path: 'Rproyectos',
      loadComponent: () =>
        import('./pages/coordinador/registrar/registrar')
          .then(m => m.Registrar)
    },
     {
      path: 'ProyectosR',
      loadComponent: () =>
        import('./pages/coordinador/proyectos/proyectos')
          .then(m => m.ProyectosComponent)
    },

    {
      path: 'Reventos',
      loadComponent: () =>
        import('./pages/coordinador/Formularios/eventos/eventos')
          .then(m => m.EventosComponent)
    },
    {
      path: 'Asistencias',
      loadComponent: () =>
        import('./pages/coordinador/Formularios/asistencia-tecnica/asistencia-tecnica')
          .then(m => m.AsistenciaTecnicaComponent)
    },





  ]
},



  {
    path: 'verproyectos',
    loadComponent: () =>
      import('./pages/verproyectos/verproyectos').then(m => m.VerProyectosComponent)
  },

  {
  path: 'verproyectos/:id', // <-- Agregamos el parámetro :id
  loadComponent: () =>
    import('./pages/verproyectos/verproyectos').then(m => m.VerProyectosComponent)
},
  {
    path: 'vereventos',
    loadComponent: () =>
      import('./pages/vereventos/ver_eventos').then(m => m.VerEventosComponent)
  },
   {
    path: 'vermapas',
    loadComponent: () =>
      import('./pages/ver_MapasRegionales/Mapasr').then(m => m.MapaR)
  },
  {
    path: 'verestadisticas',
    loadComponent: () =>
      import('./pages/home/estadisticas/estadisticas.component').then(m => m.EstadisticasComponent)
  },
  {
    path: 'verparticipantes',
    loadComponent: () =>
      import('./pages/home/participantes/participantes.component').then(m => m.ParticipantesComponent)
  },

  { path: 'actividad-detalle/:id',
    loadComponent: () =>
      import('./pages/home/participantes/activdades/actividades').then(m => m.ParticipanteDetalleComponent)
  },
  { path: 'asistencia',
    loadComponent: () =>
      import('./pages/home/asistencia/asistencia').then(m => m.AsistenciaComponent)
  },
  { path: 'capacitacion',
    loadComponent: () =>
      import('./pages/home/capacitacion/capacitacion').then(m => m.CapacitacionComponent)
  },
  { path: 'redes',
    loadComponent: () =>
      import('./pages/home/redesC/redes').then(m => m.RedesComponent)
  },
  { path: 'tranferencia',
    loadComponent: () =>
      import('./pages/home/transferencia/transferencia').then(m => m.TransferenciaComponent)
  },
  { path: 'productores',
    loadComponent: () =>
      import('./pages/home/productores/productores').then(m => m.ProductoresComponent)
  },
     
      



  // 🔹 Ruta del panel del coordinador con subrutas internas
  {
    path: 'coordinador',
    component: CoordinadorComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./pages/coordinador/inicio/inicio').then(m => m.Inicio)
      },

      {
        path: 'proyectos',
        loadComponent: () => import('./pages/coordinador/proyectos/proyectos').then(m => m.ProyectosComponent)
      },
      {
        path: 'avances',
        loadComponent: () => import('./pages/coordinador/avances/avances').then(m => m.Avances)
      },
      {
        path: 'registro',
        loadComponent: () => import('./pages/coordinador/registrar/registrar').then(m => m.Registrar)
      },
      {
        path: 'galeria',
        loadComponent: () => import('./pages/coordinador/galeria/galeria').then(m => m.GaleriaComponent)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./pages/coordinador/contacto/contacto').then(m => m.Contacto)
      },

    { path: 'mapas_regionales', 
        loadComponent: () => import('./pages/coordinador/Formularios/mapas_regionales/mapas_regionales').then(m => m.MapaRegionalComponent) },

    { path: 'participantes', 
        loadComponent: () => import('./pages/coordinador/Formularios/participantes/participantes').then(m => m.ParticipantesComponent) },
        
    { path: 'capacitacion_certificacion', 
        loadComponent: () => import('./pages/coordinador/Formularios/capacitacion_certificacion/capacitacionC').then(m => m.CapacitacionesComponent) },
    { path: 'asistencia-tecnica', 
        loadComponent: () => import('./pages/coordinador/Formularios/asistencia-tecnica/asistencia-tecnica').then(m => m.AsistenciaTecnicaComponent) },
    { path: 'redes-colaboraciones', 
        loadComponent: () => import('./pages/coordinador/Formularios/redes-colaboraciones/redes-colaboraciones').then(m => m.RedesColaboracionesComponent) },
    { path: 'transferencias-tecnologicas', 
        loadComponent: () => import('./pages/coordinador/Formularios/transferencias-tecnologicas/transferencias-tecnologicas').then(m => m.TransferenciasTecnologicasComponent) },
    { path: 'eventos', 
        loadComponent: () => import('./pages/coordinador/Formularios/eventos/eventos').then(m => m.EventosComponent) },




      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },

  // 🔹 Redirección general (corregida)
  { path: '**', redirectTo: '' }
];
