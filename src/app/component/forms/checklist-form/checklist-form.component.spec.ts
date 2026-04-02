import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChecklistFormComponent } from './checklist-form.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { FormComponentComponent } from '../../form-component/form-component.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms'; 

describe('ChecklistFormComponent', () => {
  let component: ChecklistFormComponent;
  let fixture: ComponentFixture<ChecklistFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NzFormModule,
        NzSelectModule,
        NzDatePickerModule,
        NzButtonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule 
      ],
      declarations: [ChecklistFormComponent, FormComponentComponent],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { 
            params: of({ id: 'test' }) 
          } 
        }
      ],
    });
    fixture = TestBed.createComponent(ChecklistFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});