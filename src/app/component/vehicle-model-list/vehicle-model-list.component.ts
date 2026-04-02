import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { CarModel } from 'src/app/model/car-model';
import { PageRequest } from 'src/app/model/page-request';
import { PageResponse } from 'src/app/model/page-response';
import { GettersService } from 'src/app/service/getters.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-vehicle-model-list',
  templateUrl: './vehicle-model-list.component.html',
  styleUrls: ['./vehicle-model-list.component.css']
})
export class VehicleModelListComponent implements OnInit{
  
  constructor(
    private service: GettersService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StoragesService,
  ) { }

  brandId: number | null = null;

  ngOnInit(): void {
    let id = this.route.snapshot.queryParamMap.get('id');
    if(id){
      this.brandId = +id
      this.getByBrand(this.brandId);
    }
    else
      this.get();
  }

  modelList: CarModel[] = Array<CarModel>();
  pageRequest: PageRequest = new PageRequest();
  pageResponse: PageResponse<CarModel> = <PageResponse<CarModel>>{};

  get(): void {
    this.service.getCarModels().subscribe({
      next: (response: CarModel[]) => this.modelList = response
    });
  }
  
  getByBrand(brandId: number): void {
    this.service.getCarModelsByBrand(brandId).subscribe({
      next: (response: CarModel[]) => this.modelList = response
    })
  }

  editItem(model: CarModel) {
    this.storageService.setSession('modelEdit', model);
    this.router.navigate(['form'], {queryParams: {id: model.id}, relativeTo: this.route});
  }

  goToForm() {
    if(this.brandId)
      this.router.navigate(['form'], {queryParams: {brandId: this.brandId}, relativeTo: this.route});
    else
      this.router.navigate(['form'], {relativeTo: this.route});
  }

  getVehicleModelSearch(searchTerm?: string | undefined): void {
    this.service.getVehicleModelSearch(searchTerm).subscribe({
      next: (response: CarModel[]) => {
        this.modelList = response;
      },
    });
  } 

}
