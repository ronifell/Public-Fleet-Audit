import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { VehicleService } from 'src/app/service/vehicle.service';
import { VehListComponent } from './veh-list.component';
import { Vehicle } from 'src/app/model/vehicle';
import { FiltersAndSearchComponent } from '../filters-and-search/filters-and-search.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover'; 

describe('VehListComponent', () => {
  let component: VehListComponent;
  let fixture: ComponentFixture<VehListComponent>;
  let vehicleService: VehicleService;

  beforeEach(() => {
    const vehServiceSpy = jasmine.createSpyObj('VehService', ['get']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [VehListComponent],
      providers: [VehicleService]
    });

    fixture = TestBed.createComponent(VehListComponent);
    component = fixture.componentInstance;
    vehicleService = TestBed.inject(VehicleService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call get method on init', () => {
    const getSpy = spyOn(vehicleService, 'get').and.returnValue(of([]));
    component.ngOnInit();
    expect(getSpy).toHaveBeenCalled();
  });



});