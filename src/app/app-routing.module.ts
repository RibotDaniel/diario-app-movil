import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    // Cuando la app inicie (ruta vacía), redirige automáticamente a los tabs
    path: '',
    redirectTo: 'tabs', 
    pathMatch: 'full'
  },
  {
    // Esta ruta carga el módulo de las pestañas (que contiene tu barra inferior)
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule)
  },
  
  // ¡IMPORTANTE! 
  // Si tienes una ruta aquí abajo que diga path: 'inicio', BÓRRALA o coméntala.
  // Tu página de inicio ahora se carga desde el archivo tabs-routing.module.ts
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }