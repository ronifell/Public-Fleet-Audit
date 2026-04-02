import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PageRequest } from '../model/page-request';
import { PageResponse } from '../model/page-response';
import { VehicleTravel } from '../model/vehicle-travel';

@Injectable({
  providedIn: 'root'
})
export class TravelService {

  constructor(private http: HttpClient) { }

  apiUrl: string = environment.API_URL + '/travel/';

  get(pageRequest?: PageRequest): Observable<PageResponse<VehicleTravel>> {
    let url = this.apiUrl ;
  if(pageRequest) {
    url += "?page=" + pageRequest.page + "&size=" + pageRequest.size;
  }
    return this.http.get<PageResponse<VehicleTravel>>(url);
  }

  getAll(): Observable<VehicleTravel[]> {
    let url = this.apiUrl;
    // return this.http.get<VehicleTravel[]>(url, {withCredentials: false});
    return this.http.get<VehicleTravel[]>(url);
  }

  getById(id: number): Observable<VehicleTravel> {
    let url = this.apiUrl + id;
    return this.http.get<VehicleTravel>(url);
  }

  save(objeto: VehicleTravel, assinatura1: string | Blob | null, assinatura2: string | Blob | null): Observable<VehicleTravel> {
    let url = this.apiUrl;
    const enviar = {
      travel: objeto,
      assinaturaResponsavel: assinatura1,
      assinaturaMotorista: assinatura2
    }
    if (objeto.id) {
      return this.http.put<VehicleTravel>(url, enviar);
    } else {
      return this.http.post<VehicleTravel>(url, objeto);
    }
  }
  
}
