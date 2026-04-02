import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeneralRegistersComponent } from './general-registers.component';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzIconModule } from 'ng-zorro-antd/icon'; 

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzIconModule,
  ]
})
export class GeneralRegistersModule { }