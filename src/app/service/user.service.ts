import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PageResponse } from '../model/page-response';
import { PageRequest } from '../model/page-request';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

    apiUrl: string = environment.API_URL + '/user/';

  get(pageRequest?: PageRequest): Observable<PageResponse<User>> {
    let url = this.apiUrl;
    if(pageRequest) {
      url += "?page=" + pageRequest.page + "&size=" + pageRequest.size;
    }
    return this.http.get<PageResponse<User>>(url);
  }

  getAll(): Observable<User[]> {
    let url = this.apiUrl;
    return this.http.get<User[]>(url);
  }

  getById(id: number): Observable<User> {
    let url = this.apiUrl + id;
    return this.http.get<User>(url);
  }

  save(objeto: User): Observable<User> {
    let url = this.apiUrl;
    if (objeto.id) {
      return this.http.put<User>(url, objeto);
    } else {
      return this.http.post<User>(url, objeto);
    }
  }

  comparePasswords(user: User): Observable<boolean> {
    let url = this.apiUrl + "compare"
    return this.http.post<boolean>(url, user);
  }
}
