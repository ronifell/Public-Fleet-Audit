import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Driver } from 'src/app/model/driver';
import { StoragesService } from 'src/app/service/storages.service';


@Component({
  selector: 'app-driver-edit',
  templateUrl: './driver-edit.component.html',
  styleUrls: ['./driver-edit.component.css']
})
export class DriverEditComponent implements OnInit{

  driver: Driver = <Driver>{};

  id: string | null = '';

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StoragesService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');

    if (this.id) {
      this.driver = this.storageService.getSession("driverEdit")
    }
  }

  goToItem(driver: Driver) {
    this.storageService.setSession('driverEdit', driver);
    this.router.navigate(['/driver/form'], {queryParams: {id: driver.id}});
  }
  
}
