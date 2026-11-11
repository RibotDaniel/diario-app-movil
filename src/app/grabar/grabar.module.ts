import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { GrabarPageRoutingModule } from './grabar-routing.module';

import { GrabarPage } from './grabar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GrabarPageRoutingModule
  ],
  declarations: [GrabarPage]
})
export class GrabarPageModule {}