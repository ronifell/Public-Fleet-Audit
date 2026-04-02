import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Schedule } from '../model/schedule';

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {

  constructor(private http: HttpClient) { }

  apiUrl: string = environment.API_URL + '/schedule/';

  getSchedules(): Observable<Schedule[]> {
    let url = this.apiUrl;
    return this.http.get<Schedule[]>(url);
  }

  getSchedulesById(id: number): Observable<Schedule> {
    let url = this.apiUrl + id;
    return this.http.get<Schedule>(url);
  }

  saveSchedule(schedule: Schedule): Observable<Schedule> {
    let url = this.apiUrl;
    if (schedule.id) {
      return this.http.put<Schedule>(url, schedule);
    } else {
      return this.http.post<Schedule>(url, schedule);
    }
  }

  getPeriodSchedules(date1: string, date2: string): Observable<Schedule[]> {
    let url = this.apiUrl + 'period/'
    let params = new HttpParams();
    params = params.append('date1', date1);
    params = params.append('date2', date2);
    return this.http.get<Schedule[]>(url, {params: params});
  }

}
