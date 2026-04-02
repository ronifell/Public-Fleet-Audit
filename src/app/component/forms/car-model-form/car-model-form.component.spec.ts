import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CarModelFormComponent } from './car-model-form.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { FormComponentComponent } from '../../form-component/form-component.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSelectModule } from 'ng-zorro-antd/select'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 

describe('CarModelFormComponent', () => {
  let component: CarModelFormComponent;
  let fixture: ComponentFixture<CarModelFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NzFormModule,
        ReactiveFormsModule,
        NzButtonModule,
        NzStepsModule,
        NzSelectModule,
        BrowserAnimationsModule 
      ],
      declarations: [CarModelFormComponent, FormComponentComponent],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { 
            params: of({ id: 'testId' }) 
          } 
        }
      ],
    });
    fixture = TestBed.createComponent(CarModelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});