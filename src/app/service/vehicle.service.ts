import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Vehicle } from '../model/vehicle';
import { IService } from './i-service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  
  
  constructor(private http: HttpClient) { }
  
  apiUrl: string = environment.API_URL + '/vehicle/';
  
  get(): Observable<Vehicle[]> {
    let url = this.apiUrl;
    return this.http.get<Vehicle[]>(url);
  }
  
  getAvailable(date1: string, date2: string): Observable<Vehicle[]> {
    let url = this.apiUrl + 'available/'
    let params = new HttpParams();
    
    params = params.append('date1', date1);
    params = params.append('date2', date2);

    return this.http.get<Vehicle[]>(url, {params: params});
  }

  save(vehicle: Vehicle): Observable<Vehicle> {
    let url = this.apiUrl;
    if (vehicle.id) {
      return this.http.put<Vehicle>(url, vehicle);
    } else {
      return this.http.post<Vehicle>(url, vehicle);
    }
  }

  getVehicleSearch(searchTerm?: string | undefined): Observable<Vehicle[]> {
    // console.log('Termo de busca: ' + SearchTerm);
    let url = this.apiUrl;
    if (searchTerm) {
      url += "search/" + searchTerm;
    }
    return this.http.get<Vehicle[]>(url);
  }

}
