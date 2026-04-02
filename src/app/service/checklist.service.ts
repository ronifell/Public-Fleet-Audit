import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Checklist } from '../model/checklist';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {

  constructor(private http: HttpClient) { }

  apiUrl: string = environment.API_URL + '/checklist/';

  getChecklistsByType(typeId: number): Observable<Checklist[]> {
    let url = this.apiUrl + 'type/' + typeId;
    return this.http.get<Checklist[]>(url);
  }

  saveChecklist(checklist: Checklist): Observable<Checklist> {
    let url = this.apiUrl;
    if (checklist.id) {
      return this.http.put<Checklist>(url, checklist);
    } else {
      return this.http.post<Checklist>(url, checklist);
    }
  }
  
}
