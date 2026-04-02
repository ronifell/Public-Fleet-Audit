import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Fuel } from 'src/app/model/fuel';
import { Maintenance } from 'src/app/model/maintenance';
import { AdminInputsService } from 'src/app/service/admin-inputs.service';
import { GettersService } from 'src/app/service/getters.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-maintenance-form',
  templateUrl: './maintenance-form.component.html',
  styleUrls: ['./maintenance-form.component.css'],
  providers: [ DatePipe ]
})
export class MaintenanceFormComponent implements OnInit {
  
  constructor(
    private formBuilder: FormBuilder,
    private service: AdminInputsService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StoragesService,
    private gettersService: GettersService,
    private datePipe: DatePipe,
  ) { }

  maintenance: Maintenance = <Maintenance>{};
  fuelsList: Fuel[] = [];
  id: string | null = '';
  
  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');
    
    this.getFuels();

    if (this.id) {
      this.maintenance = this.storageService.getSession('registerEdit');
      this.validateForm.patchValue(this.maintenance)
    }
  }

  validateForm = this.formBuilder.group({
    id: this.formBuilder.control<number | null>(null),
    codOS: this.formBuilder.control<number | null>(null, Validators.required),
    dataOS: this.formBuilder.control<string | null>(null, Validators.required),
    dataAprovacaoOS: this.formBuilder.control<string | null>(null),
    dataFinalizacaoOS: this.formBuilder.control<string | null>(null),
    dataEntregaVeiculo: this.formBuilder.control<string | null>(null),
    dataOrcamentoOS: this.formBuilder.control<string | null>(null),
    dataRejeitaOS: this.formBuilder.control<string | null>(null),
    dataCancelamentoOS: this.formBuilder.control<string | null>(null),
    marca: this.formBuilder.control<string | null>(null, Validators.required),
    modelo: this.formBuilder.control<string | null>(null, Validators.required),
    placa: this.formBuilder.control<string | null>(null, Validators.required),
    prefixo: this.formBuilder.control<string | null>(null),
    cidade: this.formBuilder.control<string | null>(null, Validators.required),
    base: this.formBuilder.control<string | null>(null, Validators.required),
    subunidade: this.formBuilder.control<string | null>(null, Validators.required),
    status: this.formBuilder.control<string | null>(null, Validators.required),
    posto: this.formBuilder.control<string | null>(null, Validators.required),
    optanteSimplesNacional: this.formBuilder.control<string | null>(null),
    valorPecas: this.formBuilder.control<number>(0, Validators.required),
    valorMaoDeObra: this.formBuilder.control<number>(0, Validators.required),
    valorTotal: this.formBuilder.control<number>(0, Validators.required),
    situacaoOS: this.formBuilder.control<string | null>(null),
    statusSituacaoOS: this.formBuilder.control<string | null>(null),
  })

  validInput(maintenance:Maintenance) {
    maintenance.dataOS = this.datePipe.transform(maintenance.dataOS, 'yyyy-MM-ddTHH:mm:ss')!;
    maintenance.dataAprovacaoOS = this.datePipe.transform(maintenance.dataAprovacaoOS, 'yyyy-MM-ddTHH:mm:ss');
    maintenance.dataFinalizacaoOS = this.datePipe.transform(maintenance.dataFinalizacaoOS, 'yyyy-MM-ddTHH:mm:ss');
    maintenance.dataEntregaVeiculo = this.datePipe.transform(maintenance.dataEntregaVeiculo, 'yyyy-MM-ddTHH:mm:ss');
    maintenance.dataOrcamentoOS = this.datePipe.transform(maintenance.dataOrcamentoOS, 'yyyy-MM-ddTHH:mm:ss');
    maintenance.dataRejeitaOS = this.datePipe.transform(maintenance.dataRejeitaOS, 'yyyy-MM-ddTHH:mm:ss');
    maintenance.dataCancelamentoOS = this.datePipe.transform(maintenance.dataCancelamentoOS, 'yyyy-MM-ddTHH:mm:ss');
    this.service.saveMaintenance(maintenance).subscribe({
      complete: () => this.router.navigate(['../../'], {relativeTo: this.route})
    });
  }

  getFuels() {
    this.gettersService.getFuels().subscribe({
      next: (response: Fuel[]) => this.fuelsList = response
    })    
  }

}
