import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Fuel } from 'src/app/model/fuel';
import { Supply } from 'src/app/model/supply';
import { AdminInputsService } from 'src/app/service/admin-inputs.service';
import { GettersService } from 'src/app/service/getters.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-supply-form',
  templateUrl: './supply-form.component.html',
  styleUrls: ['./supply-form.component.css'],
  providers: [ DatePipe ]
})
export class SupplyFormComponent implements OnInit {
  
  constructor(
    private formBuilder: FormBuilder,
    private service: AdminInputsService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StoragesService,
    private gettersService: GettersService,
    private datePipe: DatePipe,
  ) { }

  supply:Supply = <Supply>{};
  fuelsList: Fuel[] = [];
  id: string | null = '';
  
  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');
    this.getFuels();
    if (this.id) {
      this.supply = this.storageService.getSession('registerEdit');
      this.validateForm.patchValue(this.supply)
    }
  }

  validateForm = this.formBuilder.group({
    id: this.formBuilder.control<number | null>(null),
    cod_transaction: this.formBuilder.control<string | null>(null, Validators.required),
    transaction_date: this.formBuilder.control<string | null>(null, Validators.required),
    license_plate: this.formBuilder.control<string | null>(null, Validators.required),
    car_model: this.formBuilder.control<string | null>(null, Validators.required),
    year: this.formBuilder.control<string | null>(null, Validators.required),
    matricula: this.formBuilder.control<string | null>(null, Validators.required),
    driver_name: this.formBuilder.control<string | null>(null, Validators.required),
    fuel_type: this.formBuilder.control<string | null>(null, Validators.required),
    liters: this.formBuilder.control<number | null>(null, Validators.required),
    value_liter: this.formBuilder.control<number | null>(null, Validators.required),
    hodometro: this.formBuilder.control<number | null>(null, Validators.required),
    kms_or_hours: this.formBuilder.control<number | null>(null, Validators.required),
    km_per_liter: this.formBuilder.control<number | null>(null, Validators.required),
    emission_value: this.formBuilder.control<number | null>(null, Validators.required),
    cod_estabelecimento: this.formBuilder.control<string | null>(null, Validators.required),
    nome_estabelecimento: this.formBuilder.control<string | null>(null, Validators.required),
    endereco: this.formBuilder.control<string | null>(null, Validators.required),
    bairro: this.formBuilder.control<string | null>(null, Validators.required),
    cidade: this.formBuilder.control<string | null>(null, Validators.required),
    UF: this.formBuilder.control<string | null>(null),
    forma_transacao: this.formBuilder.control<string | null>(null, Validators.required),
    serie_pos: this.formBuilder.control<string | null>(null, Validators.required),
    numero_cartao: this.formBuilder.control<string | null>(null, Validators.required),
    familia_veiculo: this.formBuilder.control<string | null>(null, Validators.required),
  })

  validInput(supply:Supply) {
    supply.transaction_date = this.datePipe.transform(supply.transaction_date?.toString(), 'yyyy-MM-ddTHH:mm:ss')
    this.service.saveSupply(supply).subscribe({
      complete: () => this.router.navigate(['../../'], {relativeTo: this.route})
    });
  }

  getFuels() {
    this.gettersService.getFuels().subscribe({
      next: (response: Fuel[]) => this.fuelsList = response
    })    
  }

  changeValueToString(result: Date | Date[] | null) {
    let acceptedValue = this.datePipe.transform(result?.toString(), 'yyyy-MM-ddTHH:mm:ss');
    this.validateForm.patchValue({ transaction_date: acceptedValue })
  }

}
