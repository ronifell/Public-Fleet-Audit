import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EVehicleStatus } from 'src/app/model/enums/e-vehicle-status';
import { Vehicle } from 'src/app/model/vehicle';
import { VehicleService } from 'src/app/service/vehicle.service';

@Component({
  selector: 'app-consult',
  templateUrl: './consult.component.html',
  styleUrls: ['./consult.component.css']
})
export class ConsultComponent {

  public eStatus = EVehicleStatus;

  vehicleList: Vehicle[] = [];

  consultaRealizada: boolean = false;

  // Variáveis para a lógica de filtro de datas
  startDate: Date | null = null;
  endDate: Date | null = null;
  isLoading: boolean = false;

  constructor(
    private vehicleService: VehicleService,
    private message: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  consultarDisponibilidade() {
    if (!this.startDate || !this.endDate) {
      this.message.warning('Selecione as datas de início e fim.');
      return;
    }

    this.isLoading = true;
    this.vehicleList = []; // Limpa a lista antes de buscar
    this.consultaRealizada = false; // Reseta para garantir que suma enquanto carrega

    // CONVERSÃO AQUI: Date -> String 'aaaa-mm-dd'
    const startString = this.formatDate(this.startDate);
    const endString = this.formatDate(this.endDate);

    this.vehicleService.getAvailable(startString, endString)
      .subscribe({
        next: (data: Vehicle[]) => {
          this.vehicleList = data;
          this.isLoading = false;
          this.consultaRealizada = true;
          if (data.length === 0) {
            this.message.info('Nenhum veículo disponível neste período.');
          }
        },
        error: (error) => {
          console.error(error);
          this.message.error('Erro ao buscar disponibilidade.');
          this.isLoading = false;
          this.consultaRealizada = false;
        }
      });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    // O mês começa em 0 no JS, então soma +1. padStart coloca o zero à esquerda
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getVehicleSearch(termo: string) {
    if (!termo) {
      this.consultarDisponibilidade(); 
      return;
    }

    this.vehicleList = this.vehicleList.filter(v => 
      v.carModel.name.toLowerCase().includes(termo.toLowerCase()) || 
      v.licensePlate.toLowerCase().includes(termo.toLowerCase())
    );
  }

  goToItem(vehicle: Vehicle) {
    // Validação de segurança
    if (!this.startDate || !this.endDate) {
      this.message.warning('Selecione o período antes de escolher o veículo.');
      return;
    }

    const startStr = this.formatDate(this.startDate); 
    const endStr = this.formatDate(this.endDate);

    this.router.navigate(['/schedules/form'], { 
      relativeTo: this.route,
      state: { 
        vehicle: vehicle,
        dates: { 
           start: startStr, // Agora vai como string "2023-10-25"
           end: endStr 
        }
      } 
    });
  }

  traduzirStatus(status: EVehicleStatus): string {
    switch (status) {
        case EVehicleStatus.AVAILABLE: return 'Livre';
        case EVehicleStatus.TRAVEL: return 'Em Viagem';
        case EVehicleStatus.MAINTENANCE: return 'Manutenção';
        case EVehicleStatus.REVISION: return 'Revisão';
        case EVehicleStatus.INACTIVE: return 'Inativo';
        case EVehicleStatus.DISCONTINUED: return 'Descontinuado';
        default: return status;
    }
  }
}