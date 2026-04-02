import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Fuel } from 'src/app/model/fuel';
import { AdminInputsService } from 'src/app/service/admin-inputs.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-fuel-form',
  templateUrl: './fuel-form.component.html',
  styleUrls: ['./fuel-form.component.css']
})
export class FuelFormComponent implements OnInit{
  constructor(
    private formBuilder: FormBuilder,
    private service: AdminInputsService,
    private router: Router,
    private route: ActivatedRoute,
    private storageSercice: StoragesService,
  ) { }
  
  fuel: Fuel = <Fuel>{};
  id: string | null = '';
  
  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');
    
    if (this.id) {
      this.fuel = this.storageSercice.getSession('fuelEdit')

      this.validateForm.patchValue({
        name: this.fuel.name
      })
    }
  }

  validateForm: FormGroup<{
      name: FormControl<string | null>;
    }> = this.formBuilder.group({
      name: this.formBuilder.control<string | null>(null, Validators.required)
  })

  validInput(fuel: Fuel) {
    fuel = this.id ? this.putFuel(fuel) : this.postFuel(fuel);

    this.service.saveFuel(fuel).subscribe({
      complete: () => this.router.navigate(['../'], {relativeTo: this.route})
    });
  }

  putFuel(fuel: Fuel) {
    fuel.id = this.fuel.id;
    return fuel;
  }
  
  postFuel(fuel: Fuel) {
    return fuel;
  }

}
