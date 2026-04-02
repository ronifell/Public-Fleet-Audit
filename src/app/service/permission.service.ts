import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Permission } from '../model/permission';
import { PageResponse } from '../model/page-response';
import { PageRequest } from '../model/page-request';


@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(
    private http: HttpClient
  ) { }

  apiUrl: string = environment.API_URL + '/permissions/';

  get(pageRequest?: PageRequest): Observable<PageResponse<Permission>> {
    let url = this.apiUrl;
    if(pageRequest) {
      url += "?page=" + pageRequest.page + "&size=" + pageRequest.size;
    }
    return this.http.get<PageResponse<Permission>>(url);
  }
  getAll(): Observable<Permission[]> {
    let url = this.apiUrl;
    return this.http.get<Permission[]>(url);
  }

  getById(id: number): Observable<Permission> {
    let url = this.apiUrl + id;
    return this.http.get<Permission>(url);
  }

  save(objeto: Permission): Observable<Permission> {
    let url = this.apiUrl;
    if (objeto.id) {
      return this.http.put<Permission>(url, objeto);
    } else {
      return this.http.post<Permission>(url, objeto);
    }
  }

}
