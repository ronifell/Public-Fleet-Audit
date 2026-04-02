import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertService } from 'src/app/service/alert.service';

@Component({
  selector: 'app-form-component',
  templateUrl: './form-component.component.html',
  styleUrls: ['./form-component.component.css']
})
export class FormComponentComponent {

  constructor(private alertService: AlertService) {}
  
  @Input() tabTitle: string = '';
  @Input() formTitle: string = '';
  @Input() validateForm!: FormGroup<any> | FormGroup<any>[];
  @Input() loginButton: boolean = false;
  @Input() showSubmitButton: boolean = true;
  @Input() pageIndex: number = 0;

  @Output() validForm = new EventEmitter();
  @Output() indexChanged = new EventEmitter();

  showSuccess = false;
  showError = false;
  returnValue: boolean = false;
  submitForm() {
    if(this.validateForm instanceof Array) {
      for(let form of this.validateForm){
        this.returnValue = this.checkForm(form);  
        if(!this.returnValue) break
      }
      if(this.returnValue) this.validForm.emit(this.validateForm)
    } else {
      this.returnValue = this.checkForm(this.validateForm);
      if(this.returnValue) this.validForm.emit(this.validateForm.value);
    }
  }

  checkForm(form: FormGroup<any>): boolean {
    if (form.valid) { return true; }  
    else {
      Object.values(form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.alertService.showError('Preencha os campos obrigatórios.');
      return false;
    }
  }
  
  goBackButton() {
    if(this.pageIndex <= 0)
      this.pageIndex = 0
    else
      this.pageIndex = this.pageIndex - 1
    this.validForm.emit(this.pageIndex)
  }
  
}
