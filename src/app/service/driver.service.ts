import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { PageResponse } from '../model/page-response';
import { PageRequest } from '../model/page-request';
import { Driver } from '../model/driver';
import { Phone } from '../model/phone';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  constructor(private http: HttpClient) { }

  apiUrl: string = environment.API_URL + '/driver/';

  get(pageRequest?: PageRequest): Observable<PageResponse<Driver>> {
  let url = this.apiUrl ;
  if(pageRequest) {
    url += "?page=" + pageRequest.page + "&size=" + pageRequest.size;
  }
    return this.http.get<PageResponse<Driver>>(url);
  }

  getAll(): Observable<Driver[]> {
    let url = this.apiUrl;
    return this.http.get<Driver[]>(url);
  }

  getAvailable(date1: string, date2: string): Observable<Driver[]> {
    let url = this.apiUrl + 'available/'
    let params = new HttpParams();
    params = params.append("date1", date1);
    params = params.append("date2", date2);
    return this.http.get<Driver[]>(url, {params: params});
  }

  getNotExclusive(): Observable<Driver[]> {
    let url = this.apiUrl + "notExclusive/";
    return this.http.get<Driver[]>(url);
  }

  getById(id: number): Observable<Driver> {
    let url = this.apiUrl + id;
    return this.http.get<Driver>(url);
  }

  save(objeto: Driver): Observable<Driver> {
    let url = this.apiUrl;
    if (objeto.id) {
      return this.http.put<Driver>(url, objeto);
    } else {
      return this.http.post<Driver>(url, objeto);
    }
  }

  deletePhone(phone: Phone[]): Observable<void> {
    let url = this.apiUrl + "phones/";
    return this.http.delete<void>(url, { body: phone });
  }

  getDriverSearch(searchTerm?: string | undefined): Observable<Driver[]> {
    // console.log('Termo de busca: ' + searchTerm);
    let url = this.apiUrl;
    if (searchTerm) {
      url += "search/" + searchTerm;
    }
    return this.http.get<Driver[]>(url);
  }

}
