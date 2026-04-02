import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/model/user';
import { LoginService } from 'src/app/service/login.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  constructor(
    private formBuilder: FormBuilder,
    private service: LoginService
    ) {}
  
  validateForm: FormGroup<{
    userName: FormControl<string | null>;
    password: FormControl<string | null>;
  }> = this.formBuilder.group({
    userName: this.formBuilder.control<string | null>(null, Validators.required),
    password: this.formBuilder.control<string | null>(null, Validators.required),
  })

  loginUser: User = <User>{};

  submit(loginUser: User) {
    this.loginUser = loginUser;
    this.validateForm.reset();
    this.service.login(loginUser)
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    let botaoElement = <HTMLButtonElement>document.getElementsByClassName('concluir')[0];
    botaoElement.click();
  }
}