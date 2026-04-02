import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { BrandFormComponent } from './brand-form.component';
import { ActivatedRoute } from '@angular/router'; 
import { of } from 'rxjs'; 
import { FormComponentComponent } from '../../form-component/form-component.component';
import { NzFormModule } from 'ng-zorro-antd/form'; 
import { ReactiveFormsModule } from '@angular/forms'; 
import { NzButtonModule } from 'ng-zorro-antd/button'; 
import { NzStepsModule } from 'ng-zorro-antd/steps'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 

describe('BrandFormComponent', () => {
  let component: BrandFormComponent;
  let fixture: ComponentFixture<BrandFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, 
        NzFormModule, 
        ReactiveFormsModule, 
        NzButtonModule, 
        NzStepsModule,
        BrowserAnimationsModule 
      ],
      declarations: [BrandFormComponent, FormComponentComponent],
      providers: [ 
        {
          provide: ActivatedRoute, 
          useValue: { 
            params: of({ id: 'testId' }) 
          }
        }
      ]
    });
    fixture = TestBed.createComponent(BrandFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});