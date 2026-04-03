import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DriverListComponent } from './component/driver-list/driver-list.component';
import { VehListComponent } from './component/veh-list/veh-list.component';
import { SchedulingComponent } from './component/scheduling/scheduling.component';
import { DriverFormComponent } from './component/forms/driver-form/driver-form.component';
import { LoginComponent } from './component/login/login.component';
import { LoaderComponent } from './component/loader/loader.component';
import { AlertComponent } from './component/alert/alert.component';
import { UserComponent } from './component/user/user.component';
import { ThemeSelectorComponent } from './component/theme-selector/theme-selector.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { pt_BR } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { GeneralRegistersComponent } from './component/general-registers/general-registers.component';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormComponentComponent } from './component/form-component/form-component.component';
import { FuelFormComponent } from './component/forms/fuel-form/fuel-form.component';
import { BrandFormComponent } from './component/forms/brand-form/brand-form.component';
import { CarModelFormComponent } from './component/forms/car-model-form/car-model-form.component';
import { VehicleTypeFormComponent } from './component/forms/vehicle-type-form/vehicle-type-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzListModule } from 'ng-zorro-antd/list';
import { FiltersAndSearchComponent } from './component/filters-and-search/filters-and-search.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { DriverEditComponent } from './component/driver-edit/driver-edit.component';
import { ChecklistFormComponent } from './component/forms/checklist-form/checklist-form.component';
import { VehicleTypeListComponent } from './component/vehicle-type-list/vehicle-type-list.component';
import { VehicleFormComponent } from './component/forms/vehicle-form/vehicle-form.component';
import { SettingsComponent } from './component/settings/settings.component';
import { VehicleModelListComponent } from './component/vehicle-model-list/vehicle-model-list.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { FuelListComponent } from './component/fuel-list/fuel-list.component';
import { SchedulingFormComponent } from './component/forms/scheduling-form/scheduling-form.component';
import { LoaderInterceptor } from './interceptor/loader.interceptor';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ReportsComponent } from './component/reports/reports.component';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { UserEditComponent } from './component/user-edit/user-edit.component';
import { UserFormComponent } from './component/forms/user-form/user-form.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { JustHeadingComponent } from './component/just-heading/just-heading.component';
import { BrandsListComponent } from './component/brands-list/brands-list.component';
import { VehicleInfoComponent } from './component/vehicle-info/vehicle-info.component';
import { DiscontinuedVehicleFormComponent } from './component/forms/discontinued-vehicle-form/discontinued-vehicle-form.component';
import { MaintenanceFormComponent } from './component/forms/maintenance-form/maintenance-form.component';
import { SupplyFormComponent } from './component/forms/supply-form/supply-form.component';
import { SchedulesListComponent } from './component/schedules-list/schedules-list.component';
import { ScheduleEditComponent } from './component/schedule-edit/schedule-edit.component';
import { PermissionsComponent } from './component/permissions/permissions.component';
import { GroupsFormComponent } from './component/forms/groups-form/groups-form.component';
import { SignaturePadComponent } from './component/shared/signature-pad/signature-pad.component';
import { Schedule2Component } from './component/schedule2/schedule2.component';
import { Schedule2FormComponent } from './component/schedule2-form/schedule2-form.component';
import { ErrorComponent } from './component/error/error.component';
import { ErrorInterceptor } from './interceptor/error.interceptor';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { ConsultComponent } from './component/consult/consult.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Milestone1DemoComponent } from './component/milestone1-demo/milestone1-demo.component';
import { M1OdometerComponent } from './component/milestone1-demo/m1-odometer/m1-odometer.component';

registerLocaleData(pt);
@NgModule({
  declarations: [
    AppComponent,
    DriverListComponent,
    VehListComponent,
    SchedulingComponent,
    DriverFormComponent,
    LoginComponent,
    LoaderComponent,
    AlertComponent,
    UserComponent,
    ThemeSelectorComponent,
    GeneralRegistersComponent,
    CarModelFormComponent,
    FuelFormComponent,
    BrandFormComponent,
    VehicleTypeFormComponent,
    FormComponentComponent,
    FiltersAndSearchComponent,
    DriverEditComponent,
    ChecklistFormComponent,
    VehicleTypeListComponent,
    VehicleFormComponent,
    ReportsComponent,
    SettingsComponent,
    VehicleModelListComponent,
    FuelListComponent,
    SchedulingFormComponent,
    UserEditComponent,
    UserFormComponent,
    JustHeadingComponent,
    JustHeadingComponent,
    BrandsListComponent,
    VehicleInfoComponent,
    DiscontinuedVehicleFormComponent,
    MaintenanceFormComponent,
    SupplyFormComponent,
    SchedulesListComponent,
    ScheduleEditComponent,
    PermissionsComponent,
    GroupsFormComponent,
    SignaturePadComponent,
    Schedule2Component,
    Schedule2FormComponent,
    ErrorComponent,
    ConsultComponent,
    Milestone1DemoComponent,
    M1OdometerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    NzToolTipModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    NzTableModule,
    NzDividerModule,
    NzPopoverModule,
    NzTabsModule,
    NzAffixModule,
    NzFormModule,
    NzInputModule,
    NzGridModule,
    NzSpaceModule,
    NzRadioModule,
    NzDatePickerModule,
    NzStepsModule,
    NzSelectModule,
    NzButtonModule,
    NzPageHeaderModule,
    NzDropDownModule,
    NzCheckboxModule,
    NzListModule,
    NzDrawerModule,
    NzTypographyModule,
    NzCalendarModule,
    NzBadgeModule,
    NzUploadModule,
    NzAlertModule,
    NzMessageModule,
    NgxMaskDirective,
    NzAvatarModule,
    NzResultModule,
    NzDescriptionsModule,
    NzEmptyModule,
    NzTimePickerModule,
    NzModalModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: pt_BR },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    [provideNgxMask({ /* opções de cfg */ })],
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
