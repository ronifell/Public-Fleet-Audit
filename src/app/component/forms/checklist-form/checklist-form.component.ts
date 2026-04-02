import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Checklist } from 'src/app/model/checklist';
import { Driver } from 'src/app/model/driver';
import { ETravelStatus } from 'src/app/model/enums/e-travel-status';
import { Fuel } from 'src/app/model/fuel';
import { Vehicle } from 'src/app/model/vehicle';
import { VehicleTravel } from 'src/app/model/vehicle-travel';
import { ChecklistService } from 'src/app/service/checklist.service';
import { GettersService } from 'src/app/service/getters.service';
import { StoragesService } from 'src/app/service/storages.service';
import { TravelService } from 'src/app/service/travel.service';

@Component({
  selector: 'app-checklist-form',
  templateUrl: './checklist-form.component.html',
  styleUrls: ['./checklist-form.component.css']
})
export class ChecklistFormComponent implements OnInit{
  
  isFirstPage: boolean = false;
  travelId: string | null = '';
  travel: VehicleTravel | null = null;
  checklist: Checklist | null = null;
  fuelsList: Fuel[] = [];
  
  assinaturaMotorista: string | Blob | null = '';
  assinaturaResponsavel: string | Blob | null = '';

  schedulingValues = [
    {'label': 'INF',  'value': 'Informação'},
    {'label': 'C'  ,  'value': 'Conforme'},
    {'label': 'NC' ,  'value': 'Não Conforme'},
    {'label': 'NA' ,  'value': 'Não se Aplica'},
  ]

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private service: TravelService,
    private gettersService: GettersService,
    private storagesService: StoragesService,
  ) {}
  ngOnInit(): void {
    this.travelId = this.route.snapshot.queryParamMap.get('id');
    
    if(!this.travelId) 
      return

    this.travel = this.storagesService.getSession("travelEdit");
    if(this.travel){

      this.fuelsList = this.travel.vehicle.fuels

      this.assinaturaMotorista = this.travel.checklist.assinaturaMotorista
      this.assinaturaResponsavel = this.travel.checklist.assinaturaResponsavel

      if(this.travel.fuel)
        this.fuelsList.push(this.travel.fuel)
      this.travelForm.patchValue(this.travel);
      this.checklistForm.patchValue(this.travel.checklist)
    }
    
  }

  travelForm = this.formBuilder.group({
    id: 0,
    schedule_id: 0,
    vehicle: this.formBuilder.control<Vehicle | null>(null),
    driver: this.formBuilder.control<Driver | null>(null),
    diaryValue: this.formBuilder.control<number | null>(null),
    passengersAmount: this.formBuilder.control<number | null>(null),
    status: this.formBuilder.control<ETravelStatus | null>(null),
    // aqui em cima são valores pré preenchidos que não serão alterados pela tela
    // enquanto em baixo são campos que podem ser alterados através da tela
    fuel: this.formBuilder.control<Fuel | null>(null),
    departureQuilometers: this.formBuilder.control<number | null>(null),
    arrivalQuilometers: this.formBuilder.control<number | null>(null),
    drivenQuilometers: this.formBuilder.control<number | null>(null),
    usedFuelAmount: this.formBuilder.control<string | null>(null),
    registry: this.formBuilder.control<string | null>(null),
  })

  checklistForm = this.formBuilder.group({
    id: 0,
    travel: 0,
    travel_id: 0,
    buzina: this.formBuilder.control<string | null>(null),
    cinto: this.formBuilder.control<string | null>(null),
    vidros: this.formBuilder.control<string | null>(null),
    macaco: this.formBuilder.control<string | null>(null),
    quebraSol: this.formBuilder.control<string | null>(null),
    triangulo: this.formBuilder.control<string | null>(null),
    retrovisorInterno: this.formBuilder.control<string | null>(null),
    retrovisoresLaterais: this.formBuilder.control<string | null>(null),
    chaveDeRoda: this.formBuilder.control<string | null>(null),
    extensor: this.formBuilder.control<string | null>(null),
    indicadoresPainel: this.formBuilder.control<string | null>(null),
    luzPlaca: this.formBuilder.control<string | null>(null),
    oleoMotor: this.formBuilder.control<string | null>(null),
    oleoFreio: this.formBuilder.control<string | null>(null),
    luzFreio: this.formBuilder.control<string | null>(null),
    luzRe: this.formBuilder.control<string | null>(null),
    nivelAgua: this.formBuilder.control<string | null>(null),
    alarme: this.formBuilder.control<string | null>(null),
    pneus: this.formBuilder.control<string | null>(null),
    travas: this.formBuilder.control<string | null>(null),
    farois: this.formBuilder.control<string | null>(null),
    extintor: this.formBuilder.control<string | null>(null),
    lanternasDianteiras: this.formBuilder.control<string | null>(null),
    lanternasTraseiras: this.formBuilder.control<string | null>(null),
    estepe: this.formBuilder.control<string | null>(null),
    alerta: this.formBuilder.control<string | null>(null),
    cartaoAbastecimentoComCondutor: this.formBuilder.control<string | null>(null),
    habilitacaoCondutor: this.formBuilder.control<string | null>(null),
    vencimentoCarteira: this.formBuilder.control<string | null>(null),
    categoriaCarteira: this.formBuilder.control<string | null>(null),
    paraBrisas: this.formBuilder.control<string | null>(null),
    bancos: this.formBuilder.control<string | null>(null),
    documentoVeiculo: this.formBuilder.control<string | null>(null),
    assinaturaMotorista: this.formBuilder.control<string | Blob | null>(null),
    assinaturaResponsavel: this.formBuilder.control<string | Blob | null>(null),
  })

  getFuels() {
    this.gettersService.getFuels().subscribe({
      next: (response: Fuel[]) => this.fuelsList = response
    })
  }

  getAssinaturaResponsavel(assinatura: Blob) {
    this.assinaturaResponsavel = assinatura
    this.checklistForm.patchValue({ assinaturaResponsavel: assinatura })
  }

  getAssinaturaMotorista(assinatura: Blob) {
    this.assinaturaMotorista = assinatura
  }
  
  validInput(forms: FormGroup<any>[]) {
    this.travel = forms.at(0)?.value
    this.checklist = forms.at(1)?.value

    this.checklist!.travel = this.travel!.id
    this.travel!.checklist = this.checklist!
    this.service.save(this.travel!, this.assinaturaResponsavel, this.assinaturaMotorista).subscribe({
      complete: () => this.router.navigate(['/schedules/list'])
    })
  }

  validateImageText(variavel: string | Blob | null): string {
    if(typeof variavel == 'string') return variavel;
    else return ""
  }

}
