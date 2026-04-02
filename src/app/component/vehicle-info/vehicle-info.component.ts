import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Vehicle } from 'src/app/model/vehicle';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-vehicle-info',
  templateUrl: './vehicle-info.component.html',
  styleUrls: ['./vehicle-info.component.css']
})
export class VehicleInfoComponent implements OnInit{

  vehicle: Vehicle = <Vehicle>{};

  id: string | null = '';

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StoragesService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');

    if (this.id) {
      this.vehicle = this.storageService.getSession("vehicleEdit")
    }
  }

  goToItem(vehicle: Vehicle) {
    // if(!this.addButton)
    //   return;
    this.storageService.setSession('vehicleEdit', vehicle);
    this.router.navigate(['../form'], {queryParams: {id: vehicle.id}, relativeTo: this.route});
  }

  discontinueItem(vehicle: Vehicle){
    this.storageService.setSession('vehicleDelete', vehicle);
    this.router.navigate(['../discontinue'], {queryParams: {vehicleId: vehicle.id}, relativeTo: this.route});
  }

}
