import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { DriverListComponent } from './driver-list.component';
import { DriverService } from 'src/app/service/driver.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover'; 
import { FiltersAndSearchComponent } from '../filters-and-search/filters-and-search.component'; 

describe('DriverListComponent', () => {
  let component: DriverListComponent;
  let fixture: ComponentFixture<DriverListComponent>;
  let driverService: DriverService;

  const mockDriverService = {
    getAll: jasmine.createSpy('getAll').and.returnValue(of([])),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NzGridModule, NzInputModule, NzButtonModule, NzPopoverModule], 
      declarations: [DriverListComponent, FiltersAndSearchComponent], 
      providers: [
        { provide: DriverService, useValue: mockDriverService },
      ],
    });
    fixture = TestBed.createComponent(DriverListComponent);
    component = fixture.componentInstance;
    driverService = TestBed.inject(DriverService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAll on driverService when initialized', () => {
    expect(driverService.getAll).toHaveBeenCalled();
  });
});