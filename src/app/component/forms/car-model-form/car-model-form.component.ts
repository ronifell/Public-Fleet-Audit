import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CarModel } from 'src/app/model/car-model';
import { Brand } from 'src/app/model/brand';
import { AdminInputsService } from 'src/app/service/admin-inputs.service';
import { GettersService } from 'src/app/service/getters.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-carmodel-form',
  templateUrl: './car-model-form.component.html',
  styleUrls: ['./car-model-form.component.css'],
  providers: [ DatePipe ]
})
export class CarModelFormComponent implements OnInit{
  constructor(
    private formBuilder: FormBuilder,
    private saveService: AdminInputsService,
    private getterService: GettersService,
    private storageService: StoragesService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
  ) { }

  carModel: CarModel = <CarModel>{};
  brand: Brand = <Brand>{};
  brandList: Brand[] = Array<Brand>();

  id: string | null = null;
  brandId: string | null = null;

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');
    this.brandId = this.route.snapshot.queryParamMap.get('id');
    if(this.id){
      this.carModel = this.storageService.getSession("modelEdit");
      this.brand = this.carModel.brand;
      this.brandList.push(this.brand);
      this.validateForm.get('brand')?.disable();
      this.validateForm.patchValue(this.carModel);
    }
    else if(this.brandId){
      this.brand = this.storageService.getSession("brandEdit");
      this.brandList.push(this.brand);
      this.validateForm.get('brand')?.disable();
      this.validateForm.patchValue({brand: this.brand});
    }
    else
      this.getBrandList();
  }

  licenseValues = [
    {'label': 'A', 'value': 'A'},
    {'label': 'B', 'value': 'B'},
    {'label': 'C', 'value': 'C'},
    {'label': 'D', 'value': 'D'},
    {'label': 'E', 'value': 'E'}
  ]

  validateForm = this.formBuilder.group({
    id: this.formBuilder.control<number | null>(null),
    brand: this.formBuilder.control<Brand | null>(null, Validators.required),
    name: this.formBuilder.control<string | null>(null, Validators.required),
    year: this.formBuilder.control<string | null>(null, Validators.required),
    requiredLicense: this.formBuilder.control<string | null>(null, Validators.required),
    fuelCapacity: this.formBuilder.control<string | null>(null),
    enginePower: this.formBuilder.control<string | null>(null),
  })

  validInput(model: CarModel) {
    this.carModel = model;
    this.carModel.year = this.datePipe.transform(this.carModel.year, "yyyy")!
    if(this.id || this.brandId)
      this.carModel.brand = this.brand
    this.saveService.saveCarModel(this.carModel).subscribe({
      complete: () => {
        if(this.brandId)
          this.router.navigate(['../'], {queryParams: {id: this.brandId}, relativeTo: this.route})
        else 
          this.router.navigate(['../'], {relativeTo: this.route})
      }
    });
  }

  getBrandList(): void {
    this.getterService.getBrands().subscribe({
      next: (response: Brand[]) => this.brandList = response
    })
  }

}
