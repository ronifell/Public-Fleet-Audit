import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Driver } from 'src/app/model/driver';
import { PageRequest } from 'src/app/model/page-request';
import { PageResponse } from 'src/app/model/page-response';
import { User } from 'src/app/model/user';
import { DriverService } from 'src/app/service/driver.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.css'],
})
export class DriverListComponent implements OnInit{

  addButton: boolean = false;
  isAdmin: boolean = false;
  user: User = <User>{};
  
  constructor(
    private service: DriverService,
    private storageService: StoragesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getUser();
    this.isAdmin = this.storageService.validateUserPermission("ADMIN")
    // if(this.isAdmin)
    //   this.get();
    this.get();

    this.addButton = this.storageService.validateUserPermission('DRIVER_WRITE');
  }

    goToItem(driver: Driver) {
      if(!this.addButton)
        return;
      this.storageService.setSession('driverEdit', driver);
      this.router.navigate(['/driver/edit'], {queryParams: {id: driver.id}});
  }

  driverList: Driver[] = Array<Driver>();
  pageRequest: PageRequest = new PageRequest();
  pageResponse: PageResponse<Driver> = <PageResponse<Driver>>{};

  statusColors = {
    'AVAILABLE': '#87d068',
    'AWAY': '#f50',
    'RETIRED': '#f50',
    'BREAK': 'volcano',
    'SICK_NOTE': 'volcano',
    'DEAD': '#f50',
    'FIRED': '#f50',
  }

  get(): void {
    this.service.getAll().subscribe({
      next: (response: Driver[]) => {
        this.driverList = response;
      }
    });
  }

  getColor(driverStatus: any): string{
    return this.statusColors[driverStatus as keyof typeof this.statusColors];
  }

  checkOptionsOne = [
    { label: 'Em viagem', value: 'emviagem', checked: true },
    { label: 'Livres', value: 'livres' }
  ]

  getDriverSearch(searchTerm?: string | undefined): void {
    this.service.getDriverSearch(searchTerm).subscribe({
      next: (response: Driver[]) => {
        this.driverList = response;
      },
    });
  }

}
