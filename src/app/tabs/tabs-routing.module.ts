
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        // Página principal
        path: 'inicio',
        loadChildren: () =>
          import('../inicio/inicio.module')
            .then(m => m.InicioPageModule)
      },
      {
        // Página de grabación
        path: 'grabar',
        loadChildren: () =>
          import('../grabar/grabar.module')
            .then(m => m.GrabarPageModule)
      },
      {
        // Página de configuración
        path: 'configuracion',
        loadChildren: () =>
          import('../configuracion/configuracion.module')
            .then(m => m.ConfiguracionPageModule)
      },
      // NOTA: Cuando crees las otras páginas, las agregas aquí abajo:
      {
        path: 'calendario', // <--- Asegúrate de tener esta ruta aquí
        loadChildren: () => import('../calendario/calendario.module').then(m => m.CalendarioPageModule)
      },
      {
        // Redirección predeterminada
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }