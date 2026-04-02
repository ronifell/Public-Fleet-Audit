import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormComponentComponent } from './form-component.component';
import { NzFormModule } from 'ng-zorro-antd/form'; 
import { NzButtonModule } from 'ng-zorro-antd/button'; 
import { FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';

describe('FormComponentComponent', () => {
  let component: FormComponentComponent;
  let fixture: ComponentFixture<FormComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NzFormModule, NzButtonModule], 
      declarations: [FormComponentComponent]
    });
    fixture = TestBed.createComponent(FormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit validForm event when form is valid', () => {
    const formGroup = new FormGroup({
      name: new FormControl('Test', Validators.required)
    });
    component.validateForm = formGroup;

    spyOn(component.validForm, 'emit');

    component.submitForm();

    expect(component.validForm.emit).toHaveBeenCalledWith(formGroup.value);
  });

  it('should mark controls as dirty and update validity when form is invalid', () => {
    const formGroup = new FormGroup({
      name: new FormControl('', Validators.required)
    });
    component.validateForm = formGroup;

    spyOn(formGroup.controls.name, 'markAsDirty');
    spyOn(formGroup.controls.name, 'updateValueAndValidity');

    component.submitForm();

    expect(formGroup.controls.name.markAsDirty).toHaveBeenCalled();
    expect(formGroup.controls.name.updateValueAndValidity).toHaveBeenCalledWith({ onlySelf: true });
  });
});