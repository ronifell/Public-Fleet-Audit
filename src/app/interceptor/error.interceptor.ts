import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AlertService } from '../service/alert.service';
import { LoginService } from '../service/login.service';
import { Router } from '@angular/router';

const ERRO_HTTP: Record<number, string> = {
  401: "Não autorizado.",
  403: "Acesso proibido.",
  404: "Recurso não encontrado.",
  500: "Erro interno do servidor."
};
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(
    private alertService: AlertService,
    private loginService: LoginService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(erro => {

        if (request.url.includes('/login')) {
           return throwError(() => erro);
        }

        let mensagemErro = ERRO_HTTP[erro.status] || erro.error?.message || "Falha na requisição.";
        if (erro.status == 401) {
          this.loginService.logout();
          this.router.navigate(['/login']);
        }
        this.alertService.showError(
          `Erro ${erro.status}: ${mensagemErro}`
        );
        ({
        });
        return throwError(() => erro);
      })
    );
  }
}