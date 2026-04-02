import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { DriverFormComponent } from './driver-form.component';
import { ActivatedRoute } from '@angular/router'; 
import { of } from 'rxjs'; 
import { FormComponentComponent } from '../../form-component/form-component.component';
import { NzFormModule } from 'ng-zorro-antd/form'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { NzButtonModule } from 'ng-zorro-antd/button'; 
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio'; 
import { NzSelectModule } from 'ng-zorro-antd/select'; 
import { FormArray } from '@angular/forms';

describe('DriverFormComponent', () => {
  let component: DriverFormComponent;
  let fixture: ComponentFixture<DriverFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, 
        NzFormModule, 
        ReactiveFormsModule, 
        NzButtonModule, 
        NzStepsModule, 
        NzDatePickerModule, 
        FormsModule,
        NzRadioModule, 
        NzSelectModule, 
      ], 
      declarations: [DriverFormComponent, FormComponentComponent],
      providers: [ 
        {
          provide: ActivatedRoute, 
          useValue: { 
            params: of({ id: 'testId' }) 
          }
        }
      ]
    });
    fixture = TestBed.createComponent(DriverFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty phones array', () => {
    const phonesArray = component.validateForm.get('phones') as FormArray;
    expect(phonesArray?.length).toBe(0);
  });

  it('should add a phone control when addField is called', () => {
    component.addField();
    const phonesArray = component.validateForm.get('phones') as FormArray;
    expect(phonesArray?.length).toBe(1);
  });

  it('should remove a phone control when removePhone is called', () => {
    component.addField();
    component.removePhone(0);
    const phonesArray = component.validateForm.get('phones') as FormArray;
    expect(phonesArray?.length).toBe(0);
  });

});