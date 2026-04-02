import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../model/page-response';
import { PageRequest } from '../model/page-request';
import { Group } from '../model/group';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(
    private http: HttpClient
  ) { }

  apiUrl: string = environment.API_URL + '/group/';

  get(pageRequest?: PageRequest): Observable<PageResponse<Group>> {
    let url = this.apiUrl;
    if(pageRequest) {
      url += "?page=" + pageRequest.page + "&size=" + pageRequest.size;
    }
    return this.http.get<PageResponse<Group>>(url);
  }

  getAll(): Observable<Group[]> {
    let url = this.apiUrl;
    return this.http.get<Group[]>(url);
  }

  getById(id: number): Observable<Group> {
    let url = this.apiUrl + id;
    return this.http.get<Group>(url);
  }

  save(objeto: Group): Observable<Group> {
    let url = this.apiUrl;
    if (objeto.id) {
      return this.http.put<Group>(url, objeto);
    } else {
      return this.http.post<Group>(url, objeto);
    }
  }
}
