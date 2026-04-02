import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Brand } from 'src/app/model/brand';
import { PageRequest } from 'src/app/model/page-request';
import { PageResponse } from 'src/app/model/page-response';
import { GettersService } from 'src/app/service/getters.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-brands-list',
  templateUrl: './brands-list.component.html',
  styleUrls: ['./brands-list.component.css']
})
export class BrandsListComponent implements OnInit{
  
  constructor(
    private service: GettersService,
    private storageService: StoragesService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  writeBrands: boolean = false;

  ngOnInit(): void {
    this.get();
    this.writeBrands = this.storageService.validateUserPermission("BRAND_WRITE");
  }

  brandsList: Brand[] = Array<Brand>();
  pageRequest: PageRequest = new PageRequest();
  pageResponse: PageResponse<Brand> = <PageResponse<Brand>>{};
  
  get(): void {
    this.service.getBrands().subscribe({
      next: (response: Brand[]) => {
        this.brandsList = response;
      }
    });
  }

  editItem(brands: Brand) {
    this.storageService.setSession('brandEdit', brands)
    this.router.navigate(['form'], {queryParams: {id: brands.id}, relativeTo: this.route});
  }

  goToModels(brand: Brand) {
    this.storageService.setSession('brandEdit', brand);
    this.router.navigate(['models'], {queryParams: {id: brand.id}, relativeTo: this.route});
  }

  getBrandSearch(searchTerm?: string | undefined): void {
    this.service.getBrandSearch(searchTerm).subscribe({
      next: (response: Brand[]) => {
        this.brandsList = response;
      },
    });
  }

}
