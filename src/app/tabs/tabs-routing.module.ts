import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        // Esta es la pestaña de Inicio que ya tienes creada
        path: 'inicio',
        loadChildren: () => import('../inicio/inicio.module').then(m => m.InicioPageModule)
      },
      // NOTA: Cuando crees las otras páginas, las agregas aquí abajo:
      // {
      //   path: 'calendario',
      //   loadChildren: () => import('../calendario/calendario.module').then(m => m.CalendarioPageModule)
      // },
      {
        // Por defecto, cuando entres a los tabs, te mandará a la pestaña inicio
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
export class TabsPageRoutingModule {}