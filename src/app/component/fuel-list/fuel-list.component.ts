import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Fuel } from 'src/app/model/fuel';
import { PageRequest } from 'src/app/model/page-request';
import { PageResponse } from 'src/app/model/page-response';
import { GettersService } from 'src/app/service/getters.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-fuel-list',
  templateUrl: './fuel-list.component.html',
  styleUrls: ['./fuel-list.component.css']
})
export class FuelListComponent implements OnInit {

  constructor(
    private service: GettersService,
    private storageService: StoragesService,
    private router: Router,
  ) { }

  fuelList: Fuel[] = Array<Fuel>();
  pageRequest: PageRequest = new PageRequest();
  PageResponse: PageResponse<Fuel> = <PageResponse<Fuel>>{};

  ngOnInit(): void {
    this.get();
  }

  get(): void {
    this.service.getFuels().subscribe({
      next: (response: Fuel[]) => {
        this.fuelList = response;
      }
    });
  }

  editItem(fuel: Fuel) {
    this.storageService.setSession('fuelEdit', fuel);
    this.router.navigate(['admin/fuel/form'], {queryParams: {id: fuel.id}});
  }

  getFuelSearch(searchTerm?: string | undefined): void {
    this.service.getFuelSearch(searchTerm).subscribe({
      next: (response: Fuel[]) => {
        this.fuelList = response;
      },
    });
  }

}
