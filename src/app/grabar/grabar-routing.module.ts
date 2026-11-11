import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GrabarPage } from './grabar.page';

const routes: Routes = [
  {
    path: '',
    component: GrabarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrabarPageRoutingModule {}
