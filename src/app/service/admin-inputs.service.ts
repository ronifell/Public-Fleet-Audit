import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { Fuel } from '../model/fuel';
import { CarModel } from '../model/car-model';
import { Brand } from '../model/brand';
import { VehicleType } from '../model/vehicle-type';
import { User } from '../model/user';
import { DiscontinuedVehicle } from '../model/discontinued-vehicle';
import { Supply } from '../model/supply';
import { Maintenance } from '../model/maintenance';

@Injectable({
  providedIn: 'root'
})
export class AdminInputsService {

  constructor(private http: HttpClient) { }

  apiUrl: string = environment.API_URL + '/';

  saveFuel(fuel: Fuel): Observable<Fuel> {
    let url = this.apiUrl + 'fuel/';
    if (fuel.id) {
      return this.http.put<Fuel>(url, fuel);
    } else {
      return this.http.post<Fuel>(url, fuel);
    }
  }
  
  saveCarModel(carModel: CarModel): Observable<CarModel> {
    let url = this.apiUrl + 'carModel/';
    if (carModel.id) {
      return this.http.put<CarModel>(url, carModel);
    } else {
      return this.http.post<CarModel>(url, carModel);
    }
  }
  saveBrand(brand: Brand): Observable<Brand> {
    let url = this.apiUrl + 'brand/';
    if (brand.id) {
      return this.http.put<Brand>(url, brand);
    } else {
      return this.http.post<Brand>(url, brand);
    }
  }
  saveVehicleType(vehicleType: VehicleType): Observable<VehicleType> {
    let url = this.apiUrl + 'vehicleType/';
    if (vehicleType.id) {
      return this.http.put<VehicleType>(url, vehicleType);
    } else {
      return this.http.post<VehicleType>(url, vehicleType);
    }
  }
  saveUser(user: User): Observable<User> {
    let url = this.apiUrl + 'user/';
    if (user.id) {
      return this.http.put<User>(url, user);
    } else {
      return this.http.post<User>(url, user);
    }
  }

  saveDiscontinuedVehicle(discontinuedVehicle: DiscontinuedVehicle): Observable<DiscontinuedVehicle> {
    let url = this.apiUrl + 'discontinuedVehicle/';
    if (discontinuedVehicle.id) {
      return this.http.put<DiscontinuedVehicle>(url, discontinuedVehicle);
    } else {
      return this.http.post<DiscontinuedVehicle>(url, discontinuedVehicle);
    }
  }

  saveSupply(supply: Supply): Observable<Supply> {
    let url = this.apiUrl + 'supply/';
    if (supply.id) {
      return this.http.put<Supply>(url, supply);
    } else {
      return this.http.post<Supply>(url, supply);
    }
  }

  saveMaintenance(maintenance: Maintenance): Observable<Maintenance> {
    let url = this.apiUrl + 'maintenance/';
    if (maintenance.id) {
      return this.http.put<Maintenance>(url, maintenance);
    } else {
      return this.http.post<Maintenance>(url, maintenance);
    }
  }
  
}
