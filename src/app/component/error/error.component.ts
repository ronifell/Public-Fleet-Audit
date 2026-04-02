import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzResultModule, NzResultStatusType } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
})
export class ErrorComponent implements OnInit{

  errorCode: string = '404';
  errorTitle: string = '';
  errorMessage: string = '';

  status: NzResultStatusType = '404';

  private errorMessages: any = {
    '404': { title: '404', message: 'Desculpe, a página que você visitou não existe.' },
    '403': { title: '403', message: 'Desculpe, você não tem autorização para acessar esta página.' },
    '500': { title: '500', message: 'Desculpe, ocorreu um erro no servidor.' },
    'default': { title: 'Ops', message: 'Ocorreu um erro inesperado.' }
  };

  constructor(
    private route: ActivatedRoute, 
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.errorCode = this.route.snapshot.paramMap.get('codigo') || '404';

    this.status = this.mapStatus(this.errorCode);

    const content = this.errorMessages[this.errorCode] || this.errorMessages['default'];
    
    this.errorTitle = content.title;
    this.errorMessage = content.message;


  }

  private mapStatus(code: string): NzResultStatusType {
    if (['403', '404', '500'].includes(code)) {
      return code as NzResultStatusType;
    }
    return 'warning'; 
  }

}
