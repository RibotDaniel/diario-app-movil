
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