import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private messageService: NzMessageService) {}

  showSuccess(message: string): void {
    this.messageService.success(message);
  }

  showError(message: string): void {
    this.messageService.error(message);
  }
}
