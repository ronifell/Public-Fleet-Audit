import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageRequest } from 'src/app/model/page-request';
import { PageResponse } from 'src/app/model/page-response';
import { VehicleType } from 'src/app/model/vehicle-type';
import { DriverService } from 'src/app/service/driver.service';
import { GettersService } from 'src/app/service/getters.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-vehicle-type-list',
  templateUrl: './vehicle-type-list.component.html',
  styleUrls: ['./vehicle-type-list.component.css']
})
export class VehicleTypeListComponent implements OnInit{

    col1 = {
      minWidth: 'fit-content',
      width: '90%',
      textAlign: 'center'
    };

    col2 = {
      width: '10%',
      textAlign: 'center'
    };

    constructor(
      private service: GettersService,
      private storageService: StoragesService,
      private router: Router,
      private route: ActivatedRoute,
    ) { }
  
    ngOnInit(): void {
      this.get();
    }
  
    typeList: VehicleType[] = Array<VehicleType>();
    pageRequest: PageRequest = new PageRequest();
    pageResponse: PageResponse<VehicleType> = <PageResponse<VehicleType>>{};
  
    get(): void {
      this.service.getVehicleType().subscribe({
        next: (response: VehicleType[]) => {
          this.typeList = response;
        }
      });
    }
    goToVehicleChekclists(vType: VehicleType) {
      this.storageService.setSession('vType', vType);
      this.router.navigate(['/checklist'])
    }

    getVehicleTypeSearch(searchTerm?: string | undefined): void {
      this.service.getVehicleTypeSearch(searchTerm).subscribe({
        next: (response: VehicleType[]) => {
          this.typeList = response;
        },
      });
    }

    editItem(vehicleType: VehicleType) {
        console.log("No edit:", vehicleType);
        this.storageService.setSession('vehicleTypeEdit', vehicleType)
        this.router.navigate(['form'], {queryParams: {id: vehicleType.id}, relativeTo: this.route});
      }

}
