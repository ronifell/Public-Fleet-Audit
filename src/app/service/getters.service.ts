import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { Fuel } from '../model/fuel';
import { CarModel } from '../model/car-model';
import { Brand } from '../model/brand';
import { VehicleType } from '../model/vehicle-type';

@Injectable({
  providedIn: 'root'
})
export class GettersService {

  constructor(private http: HttpClient) { }

  apiUrl: string = environment.API_URL + '/';
  
  getFuels(id?:number): Observable<Fuel[]> {
    let url = this.apiUrl + 'fuel/';
    if (id) {
      url += id
    }
    return this.http.get<Fuel[]>(url);
  }

  getCarModels(id?:number): Observable<CarModel[]> {
    let url = this.apiUrl + 'carModel/';
    if (id) {
      url += id
    }
    return this.http.get<CarModel[]>(url);
  }

  getCarModelsByBrand(id:number): Observable<CarModel[]> {
    let url = this.apiUrl + 'carModel/brand/' + id;
    return this.http.get<CarModel[]>(url);
  }

  getBrands(id?:number): Observable<Brand[]> {
    let url = this.apiUrl + 'brand/';
    if (id) {
      url += id
    }
    return this.http.get<Brand[]>(url);
  }

  getVehicleType(id?:number): Observable<VehicleType[]> {
    let url = this.apiUrl + 'vehicleType/';
    if (id) {
      url += id
    }
    return this.http.get<VehicleType[]>(url);
  }

  // Searching

  getFuelSearch(searchTerm?: string | undefined): Observable<Fuel[]> {
    // console.log('Termo de busca: ' + searchTerm);
    let url = this.apiUrl;
    if (searchTerm) {
      url += "fuel/search/" + searchTerm;
    }
    return this.http.get<Fuel[]>(url);
  }

  getVehicleTypeSearch(searchTerm?: string | undefined): Observable<VehicleType[]> {
    // console.log('Termo de busca: ' + searchTerm);
    let url = this.apiUrl;
    if (searchTerm) {
      url += "vehicleType/search/" + searchTerm;
    }
    return this.http.get<VehicleType[]>(url);
  }

  getVehicleModelSearch(searchTerm?: string | undefined): Observable<CarModel[]> {
    // console.log('Termo de busca: ' + searchTerm);
    let url = this.apiUrl;
    if (searchTerm) {
      url += "carModel/search/" + searchTerm;
    }
    return this.http.get<CarModel[]>(url);
  }

  getBrandSearch(searchTerm?: string | undefined): Observable<Brand[]> {
    // console.log('Termo de busca: ' + searchTerm);
    let url = this.apiUrl;
    if (searchTerm) {
      url += "brand/search/" + searchTerm;
    }
    return this.http.get<Brand[]>(url);
  }
  
}

