import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Schedule2 } from 'src/app/model/schedule2';
import { User } from 'src/app/model/user';
import { Schedule2Service } from 'src/app/service/schedule2.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-schedule2',
  templateUrl: './schedule2.component.html',
  styleUrls: ['./schedule2.component.css']
})
export class Schedule2Component implements OnInit {

  isAdmin: boolean = false;
  canWrite: boolean = false; // Substituí addButton por canWrite para ficar mais claro
  user: User = <User>{};

  isLoading: boolean = false;

  schedulesList: Schedule2[] = [];
  
  scheduleSections: {
    key: string;
    title: string;
    subtitle: string;
    items: Schedule2[];
  }[] = [];

  constructor(
    private service: Schedule2Service,
    private storageService: StoragesService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getUser();
    this.isAdmin = this.storageService.validateUserPermission("ADMIN");
    
    // Verifica se tem permissão de escrita (para mostrar o botão de adicionar)
    this.canWrite = this.storageService.validateUserPermission('SCHEDULE_WRITE');

    if (this.isAdmin) {
      this.getAll();
    } else {
      // Se não é admin, busca apenas os agendamentos DESTE usuário
      this.getByUser();
    }
  }

  buildSections(): void {
    const activeStatuses = ['SOLICITADO', 'AGENDADO', 'EM_ANDAMENTO'];

    const agendados = this.schedulesList
      .filter(item => activeStatuses.includes(item.status))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const historico = this.schedulesList
      .filter(item => !activeStatuses.includes(item.status))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    this.scheduleSections = [
      {
        key: 'agendados',
        title: 'Agendados',
        subtitle: 'Solicitações em aberto, confirmadas ou em andamento.',
        items: agendados
      },
      {
        key: 'historico',
        title: 'Histórico',
        subtitle: 'Agendamentos já encerrados, cancelados, recusados, expirados ou não iniciados.',
        items: historico
      }
    ];
  }

  // Busca geral (Admin)
  getAll(): void {
    this.service.getSchedules().subscribe({
      next: (response: Schedule2[]) => {
        this.schedulesList = response;
        this.buildSections();
      },
      error: (err) => console.error(err)
    });
  }

  // Busca específica (Usuário Comum)
  getByUser(): void {
    if (this.user && this.user.id) {
      this.service.getSchedulesByUserId(this.user.id).subscribe({
        next: (response: Schedule2[]) => {
          this.schedulesList = response;
          this.buildSections();
        },    
        error: (err) => console.error(err)
      });
    }
  }

  goToItem(schedule: Schedule2) {
    if (!this.canWrite && !this.isAdmin) {
       return; 
    }

    this.storageService.setSession('scheduleEdit', schedule);
    this.router.navigate(['/schedules/form'], { queryParams: { id: schedule.id } });
  }

  getStatusClass(status: string | undefined): string {
  switch (status) {
    case 'SOLICITADO':
      return 'status-solicitado';

    case 'AGENDADO':
      return 'status-agendado';

    case 'EM_ANDAMENTO':
      return 'status-em-andamento';

    case 'FINALIZADO':
      return 'status-finalizado';

    case 'CANCELADO':
      return 'status-cancelado';

    case 'RECUSADO':
      return 'status-recusado';

    case 'NAO_INICIADO':
      return 'status-nao-iniciado';

    case 'EXPIRADO':
      return 'status-expirado';

    default:
      return 'status-default';
  }
}
}