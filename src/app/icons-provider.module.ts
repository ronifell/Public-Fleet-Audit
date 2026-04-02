import { NgModule } from '@angular/core';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';

import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  FormOutline,
  CarOutline,
  UserOutline,
  ScheduleOutline,
  TeamOutline,
  CompassOutline,
  DatabaseOutline,
  LineOutline,
  SolutionOutline,
  CalendarOutline,
} from '@ant-design/icons-angular/icons';

const icons = [MenuFoldOutline, MenuUnfoldOutline, FormOutline, CarOutline, UserOutline, ScheduleOutline, TeamOutline, CompassOutline, DatabaseOutline, LineOutline, SolutionOutline, CalendarOutline];

@NgModule({
  imports: [NzIconModule],
  exports: [NzIconModule],
  providers: [
    { provide: NZ_ICONS, useValue: icons }
  ]
})
export class IconsProviderModule {
}
