import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { FuelFormComponent } from './fuel-form.component';
import { ActivatedRoute } from '@angular/router'; 
import { of } from 'rxjs'; 
import { FormComponentComponent } from '../../form-component/form-component.component';
import { NzFormModule } from 'ng-zorro-antd/form'; 
import { ReactiveFormsModule } from '@angular/forms'; 
import { NzButtonModule } from 'ng-zorro-antd/button'; 

describe('FuelFormComponent', () => {
  let component: FuelFormComponent;
  let fixture: ComponentFixture<FuelFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NzFormModule, ReactiveFormsModule, NzButtonModule], 
      declarations: [FuelFormComponent, FormComponentComponent],
      providers: [ 
        {
          provide: ActivatedRoute, 
          useValue: { 
            params: of({ id: 'testId' }) 
          }
        }
      ]
    });
    fixture = TestBed.createComponent(FuelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});