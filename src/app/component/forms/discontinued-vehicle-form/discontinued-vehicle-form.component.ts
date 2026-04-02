import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DiscontinuedVehicle } from 'src/app/model/discontinued-vehicle';
import { Vehicle } from 'src/app/model/vehicle';
import { AdminInputsService } from 'src/app/service/admin-inputs.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-discontinued-vehicle-form',
  templateUrl: './discontinued-vehicle-form.component.html',
  styleUrls: ['./discontinued-vehicle-form.component.css'],
  providers: [ DatePipe ]
})
export class DiscontinuedVehicleFormComponent implements OnInit {
  
  constructor(
    private formBuilder: FormBuilder,
    private service: AdminInputsService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StoragesService,
    private datePipe: DatePipe,
  ) { }

  discontinuedVehicle: Vehicle = <Vehicle>{};
  id: string | null = '';
  
  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');

    if(this.id) 
      this.validateForm.patchValue(this.discontinuedVehicle)
    else {
      this.discontinuedVehicle = this.storageService.getSession('vehicleDelete');
      this.validateForm.patchValue({ vehicle: this.discontinuedVehicle })
    }
    
  }

  validateForm = this.formBuilder.group({
    id: this.formBuilder.control<number | null>(null),
    vehicle: this.formBuilder.control<Vehicle>(<Vehicle>{}, Validators.required),
    date: this.formBuilder.control<string>('', Validators.required),
    time: this.formBuilder.control<string>('', Validators.required),
    processNumber: this.formBuilder.control<string | null>(null, Validators.required),
    description: this.formBuilder.control<string | null>(null),
  })

  validInput(beingDiscontinued: DiscontinuedVehicle) {
    beingDiscontinued.date = this.datePipe.transform(beingDiscontinued.date, "yyyy-MM-dd")!
    this.service.saveDiscontinuedVehicle(beingDiscontinued).subscribe({
      complete: () => this.router.navigate(['../'], {relativeTo: this.route})
    });
  }

}
