import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverListComponent } from './component/driver-list/driver-list.component';
import { DriverFormComponent } from './component/forms/driver-form/driver-form.component';
import { SchedulingComponent } from './component/scheduling/scheduling.component';
import { VehListComponent } from './component/veh-list/veh-list.component';
import { FuelFormComponent } from './component/forms/fuel-form/fuel-form.component';
import { BrandFormComponent } from './component/forms/brand-form/brand-form.component';
import { CarModelFormComponent } from './component/forms/car-model-form/car-model-form.component';
import { VehicleTypeFormComponent } from './component/forms/vehicle-type-form/vehicle-type-form.component';
import { UserComponent } from './component/user/user.component';
import { GeneralRegistersComponent } from './component/general-registers/general-registers.component';
import { DriverEditComponent } from './component/driver-edit/driver-edit.component';
import { VehicleTypeListComponent } from './component/vehicle-type-list/vehicle-type-list.component';
import { ChecklistFormComponent } from './component/forms/checklist-form/checklist-form.component';
import { SettingsComponent } from './component/settings/settings.component';
import { VehicleModelListComponent } from './component/vehicle-model-list/vehicle-model-list.component';
import { VehicleFormComponent } from './component/forms/vehicle-form/vehicle-form.component';
import { FuelListComponent } from './component/fuel-list/fuel-list.component';
import { SchedulingFormComponent } from './component/forms/scheduling-form/scheduling-form.component';
import { LoginComponent } from './component/login/login.component';
import { authGuard } from './service/auth.guard';
import { UserEditComponent } from './component/user-edit/user-edit.component';
import { UserFormComponent } from './component/forms/user-form/user-form.component';
import { ReportsComponent } from './component/reports/reports.component';
import { BrandsListComponent } from './component/brands-list/brands-list.component';
import { VehicleInfoComponent } from './component/vehicle-info/vehicle-info.component';
import { DiscontinuedVehicleFormComponent } from './component/forms/discontinued-vehicle-form/discontinued-vehicle-form.component';
import { SupplyFormComponent } from './component/forms/supply-form/supply-form.component';
import { MaintenanceFormComponent } from './component/forms/maintenance-form/maintenance-form.component';
import { SchedulesListComponent } from './component/schedules-list/schedules-list.component';
import { ScheduleEditComponent } from './component/schedule-edit/schedule-edit.component';
import { PermissionsComponent } from './component/permissions/permissions.component';
import { GroupsFormComponent } from './component/forms/groups-form/groups-form.component';
import { Schedule2Component } from './component/schedule2/schedule2.component';
import { Schedule2FormComponent } from './component/schedule2-form/schedule2-form.component';
import { ErrorComponent } from './component/error/error.component';
import { ConsultComponent } from './component/consult/consult.component';
import { Milestone1DemoComponent } from './component/milestone1-demo/milestone1-demo.component';
import { InovaThecGovernancaComponent } from './component/inova-thec-governanca/inova-thec-governanca.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'milestone1-demo', component: Milestone1DemoComponent },
  { path: 'inova-thec', component: InovaThecGovernancaComponent },
  { path: 'inova-thec/sig-frota', component: InovaThecGovernancaComponent },
  { path: 'inova-thec/sig-frota/:tela', component: InovaThecGovernancaComponent },
  { path: 'inova-thec/sig-patrimonio', component: InovaThecGovernancaComponent },
  { path: 'inova-thec/sig-patrimonio/:tela', component: InovaThecGovernancaComponent },
  { path: 'erro/:codigo', component: ErrorComponent },
  { path: '', canActivate: [authGuard], children: [
      // { path: 'schedules', children: [
      //   { path: '', component: SchedulingComponent},
      //   { path: 'list', component: SchedulesListComponent},
      //   { path: 'edit', component: ScheduleEditComponent},
      //   { path: 'form', component: SchedulingFormComponent, canActivate: [authGuard], data: { permissions: ['SCHEDULE_WRITE']}},
      // ]},
  { path: 'consult', component: ConsultComponent, canActivate: [authGuard], data: { permissions: ['VEHICLE_READ', 'DRIVER_READ', 'SCHEDULE_READ'] } },
  { path: 'calendar', component: SchedulingComponent, canActivate: [authGuard], data: { permissions: ['SCHEDULE_READ'] } },
  {path: 'schedules', canActivate: [authGuard], data: { permissions: ['SCHEDULE_READ'] }, children: [
      { path: '', component: Schedule2Component },
      { path: 'edit', component: ScheduleEditComponent, canActivate: [authGuard], data: { permissions: ['SCHEDULE_WRITE'] } },
      { path: 'form', component: Schedule2FormComponent, canActivate: [authGuard], data: { permissions: ['SCHEDULE_WRITE'] } },
    ]},
      {path: 'driver', canActivate: [authGuard], data: { permissions: ['DRIVER_READ'] }, children: [
          { path: '', component: DriverListComponent },
          { path: 'form', component: DriverFormComponent, canActivate: [authGuard], data: { permissions: ['DRIVER_WRITE'] } },
          { path: 'edit', component: DriverEditComponent, canActivate: [authGuard], data: { permissions: ['DRIVER_WRITE'] } },
        ]
      },
      {
        path: 'vehicle', canActivate: [authGuard], data: { permissions: ['VEHICLE_READ'] }, children: [
          { path: '', component: VehListComponent },
          { path: 'form', component: VehicleFormComponent, canActivate: [authGuard], data: { permissions: ['VEHICLE_WRITE'] } },
          { path: 'edit', component: VehicleInfoComponent, canActivate: [authGuard], data: { permissions: ['VEHICLE_WRITE'] } },
          { path: 'discontinue', component: DiscontinuedVehicleFormComponent, canActivate: [authGuard], data: { permissions: ['VEHICLE_DELETE'] } },
        ]
      },
      {
        path: 'user', children: [
          { path: '', component: UserComponent, canActivate: [authGuard], data: { permissions: ['USER_READ'] } },
          { path: 'edit', component: UserEditComponent },
          { path: 'form', component: UserFormComponent, canActivate: [authGuard], data: { permissions: ['USER_WRITE'] } },
        ]
      },
      {
        path: 'registros', canActivate: [authGuard], data: { permissions: ['SUPPLY_READ', 'MAINTENANCE_READ'] }, children: [
          { path: '', component: GeneralRegistersComponent },
          { path: 'supply/form', canActivate: [authGuard], data: { permissions: ['SUPPLY_WRITE'] }, component: SupplyFormComponent },
          { path: 'maintenance/form', canActivate: [authGuard], data: { permissions: ['MAINTENANCE_WRITE'] }, component: MaintenanceFormComponent },
        ]
      },
      {
        path: 'brand', canActivate: [authGuard], data: { permissions: ['BRAND_READ'] }, children: [
          { path: '', component: BrandsListComponent },
          { path: 'form', component: BrandFormComponent, canActivate: [authGuard], data: { permissions: ['BRAND_WRITE'] } },
          {
            path: 'models', canActivate: [authGuard], data: { permissions: ['CAR_MODEL_READ'] }, children: [
              { path: '', component: VehicleModelListComponent },
              { path: 'form', component: CarModelFormComponent, canActivate: [authGuard], data: { permissions: ['CAR_MODEL_WRITE'] } }
            ]
          },
        ]
      },
      {
        path: 'models', canActivate: [authGuard], data: { permissions: ['CAR_MODEL_READ'] }, children: [
          { path: '', component: VehicleModelListComponent },
          { path: 'form', component: CarModelFormComponent, canActivate: [authGuard], data: { permissions: ['CAR_MODEL_WRITE'] } },
        ]
      },
      {
        path: 'vehicle-type', canActivate: [authGuard], data: { permissions: ['VEHICLE_TYPE_READ'] }, children: [
          { path: '', component: VehicleTypeListComponent },
          { path: 'form', component: VehicleTypeFormComponent, canActivate: [authGuard], data: { permissions: ['VEHICLE_TYPE_WRITE'] } },
        ]
      },
      // { path: 'settings', component: SettingsComponent},
      { path: 'reports', component: ReportsComponent, canActivate: [authGuard], data: { permissions: ['REPORT_READ'] } },
      {
        path: 'checklist', canActivate: [authGuard], data: { permissions: ['CHECKLIST_READ'] }, children: [
          { path: 'form', component: ChecklistFormComponent, canActivate: [authGuard], data: { permissions: ['CHECKLIST_WRITE'] } },
        ]
      },
      {
        path: 'admin', canActivate: [authGuard], data: { permissions: ['ADMIN' , 'GROUP_READ']}, children: [
          {
            path: 'fuel', canActivate: [authGuard], data: { permissions: ['FUEL_READ'] }, children: [
              { path: '', component: FuelListComponent, },
              { path: 'form', component: FuelFormComponent, canActivate: [authGuard], data: { permissions: ['FUEL_WRITE'] } },
            ]
          },
          {
            path: 'permissions', canActivate: [authGuard], data: { permissions: ['GROUP_READ'] }, children: [
              { path: '', component: PermissionsComponent },
              { path: 'form', component: GroupsFormComponent, canActivate: [authGuard], data: { permissions: ['GROUP_WRITE'] } },
            ]
          },

        ]
      }
    ]
  },
  { path: '**', redirectTo: 'erro/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
