import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { VehicleModelListComponent } from './vehicle-model-list.component';
import { NzGridModule } from 'ng-zorro-antd/grid'; 
import { NzInputModule } from 'ng-zorro-antd/input'; 

describe('VehicleModelListComponent', () => {
  let component: VehicleModelListComponent;
  let fixture: ComponentFixture<VehicleModelListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VehicleModelListComponent],
      imports: [
        HttpClientTestingModule,
        NzGridModule,
        NzInputModule 
      ] 
    });
    fixture = TestBed.createComponent(VehicleModelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});