import { Component, OnInit } from '@angular/core';
import { Vehicle } from 'src/app/model/vehicle';
import { VehicleService } from 'src/app/service/vehicle.service';
import { PageRequest } from 'src/app/model/page-request';
import { PageResponse } from 'src/app/model/page-response';
import { StoragesService } from 'src/app/service/storages.service';
import { Router } from '@angular/router';
import { User } from 'src/app/model/user';


@Component({
  selector: 'app-veh-list',
  templateUrl: './veh-list.component.html',
  styleUrls: ['./veh-list.component.css']
})
export class VehListComponent implements OnInit {

  isAdmin: boolean = false;
  user: User = <User>{};
  addButton: boolean = false;
  constructor(
    private service: VehicleService,
    private storageService: StoragesService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getUser()
    this.isAdmin = this.storageService.validateUserPermission("ADMIN")
    this.get();

    this.addButton = this.storageService.validateUserPermission('VEHICLE_WRITE');
  }

  vehicleList: Vehicle[] = Array<Vehicle>();
  pageRequest: PageRequest = new PageRequest();
  pageResponse: PageResponse<Vehicle> = <PageResponse<Vehicle>>{};

  get(): void {
    this.service.get().subscribe({
      next: (response: Vehicle[]) => {
        this.vehicleList = response;
      }
    });
  }

  colorStatus(): void {
    const status = document.querySelector<HTMLElement>('class.value2');
    if(status?.innerText == 'AVAILABLE'){
      status.style.backgroundColor = 'green';
    }
  }

  goToItem(vehicle: Vehicle) {
    if(!this.addButton)
      return;
    this.storageService.setSession('vehicleEdit', vehicle);
    this.router.navigate(['/vehicle/edit'], {queryParams: {id: vehicle.id}});
  }

  getVehicleSearch(searchTerm?: string | undefined): void {
    this.service.getVehicleSearch(searchTerm).subscribe({
      next: (response: Vehicle[]) => {
        this.vehicleList = response;
      },
    });
  }

}
