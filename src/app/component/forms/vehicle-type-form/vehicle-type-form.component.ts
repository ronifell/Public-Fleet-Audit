import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VehicleType } from 'src/app/model/vehicle-type';
import { AdminInputsService } from 'src/app/service/admin-inputs.service';
import { AlertService } from 'src/app/service/alert.service';
import { StoragesService } from 'src/app/service/storages.service';


@Component({
  selector: 'app-vehicletype-form',
  templateUrl: './vehicle-type-form.component.html',
  styleUrls: ['./vehicle-type-form.component.css']
})
export class VehicleTypeFormComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private service: AdminInputsService,
    private storageService: StoragesService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
  ) { }

    ngOnInit(): void {
        this.id = this.route.snapshot.queryParamMap.get('id');
        if (this.id) {
            this.vehicleType = this.storageService.getSession('vehicleTypeEdit');
            console.log(this.vehicleType);
            console.log(this.storageService.getSession('vehicleTypeEdit'));
            this.validateForm.patchValue(this.vehicleType)
        }
        console.log(this.vehicleType);
    }

  vehicleType: VehicleType = <VehicleType>{};
  id: string | null = '';


  validateForm: FormGroup<{
      name: FormControl<string | null>;
    }> = this.formBuilder.group({
      name: this.formBuilder.control<string | null>(null, Validators.required)
  })

  validInput(objeto: any) {
    this.vehicleType = objeto;
    this.service.saveVehicleType(this.vehicleType).subscribe({
      next: () => {
        this.alertService.showSuccess('Requisição realizada com sucesso!');
      },
      error: () => {
        this.alertService.showError('Erro na requisição. Verifique o console para mais detalhes.');
      },  
      complete: () => this.router.navigate(['../'], {relativeTo: this.route})
    });
  }

}
