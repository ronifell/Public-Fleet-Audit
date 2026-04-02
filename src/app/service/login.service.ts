import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../model/user';
import { environment } from 'src/environments/environment';
import { TokenResponse } from '../model/token-response';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  isloggedin : boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private alertService: AlertService
  ) {
    
    this.isloggedin = false;

    this.user = JSON.parse(sessionStorage.getItem('USER') || '{}');
    this.authUser.next(this.user);
  }

  private user: User = <User>{};
  authUser: BehaviorSubject<User> = new BehaviorSubject<User>(this.user);

  login(loginUser: User): void {
    let url = environment.API_URL + '/login';
    this.http.post<TokenResponse>(url, loginUser).subscribe({
      next: (resposta: TokenResponse) => {

        const token = resposta.token;
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const tokenExpiration = decodedToken.exp * 1000;

        loginUser.userName = decodedToken.sub;
        loginUser.fullName = decodedToken.fullName;

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('tokenExpiration', tokenExpiration.toString());

        let userId = decodedToken.id;

        this.userService.getById(userId).subscribe((user: User) => {
          sessionStorage.setItem('USER', JSON.stringify(user));
          this.authUser.next(user);
        })

      },
      error: (erro) => {
        if (erro.status === 403 || erro.status === 401) {
          const mensagem = "Usuário ou senha incorreta";
          this.alertService.showError(mensagem);
        } else {
          this.alertService.showError("Erro ao conectar com o servidor.");
        }
      },
      complete: () => {
        this.router.navigate(['/']);
      }

    });
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('USER');
    sessionStorage.removeItem('tokenExpiration');
    this.router.navigate(['/login']);
  }

  isExpired(): boolean {
    const expiration = sessionStorage.getItem('tokenExpiration');
    const expirationDate = new Date(Number(expiration));
    return expirationDate < new Date();
  }

  splitString(permissions: string) {
    let text = permissions.substring(1, permissions.length - 1).split(", ");
    return text
  }

}
