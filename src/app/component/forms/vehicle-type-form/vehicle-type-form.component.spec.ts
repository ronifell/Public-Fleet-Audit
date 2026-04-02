import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { VehicleTypeFormComponent } from './vehicle-type-form.component';
import { ActivatedRoute } from '@angular/router'; 
import { of } from 'rxjs'; 
import { FormComponentComponent } from '../../form-component/form-component.component';
import { NzFormModule } from 'ng-zorro-antd/form'; 
import { ReactiveFormsModule } from '@angular/forms'; 
import { NzButtonModule } from 'ng-zorro-antd/button'; 

describe('VehicleTypeFormComponent', () => {
  let component: VehicleTypeFormComponent;
  let fixture: ComponentFixture<VehicleTypeFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NzFormModule, ReactiveFormsModule, NzButtonModule], 
      declarations: [VehicleTypeFormComponent, FormComponentComponent],
      providers: [ 
        {
          provide: ActivatedRoute, 
          useValue: { 
            params: of({ id: 'testId' }) 
          }
        }
      ]
    });
    fixture = TestBed.createComponent(VehicleTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});