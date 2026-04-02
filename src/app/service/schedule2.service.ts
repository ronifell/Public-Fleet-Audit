import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Schedule2 } from '../model/schedule2';

@Injectable({
  providedIn: 'root'
})
export class Schedule2Service {

  constructor(private http: HttpClient) { }

  apiUrl: string = environment.API_URL + '/schedule2/';

  getSchedules(): Observable<Schedule2[]> {
    let url = this.apiUrl;
    return this.http.get<Schedule2[]>(url);
  }

  getSchedulesById(id: number): Observable<Schedule2> {
    let url = this.apiUrl + id;
    return this.http.get<Schedule2>(url);
  }

  getSchedulesByUserId(userId: number): Observable<Schedule2[]> {
    let url = this.apiUrl + 'user/' + userId;
    return this.http.get<Schedule2[]>(url);
  }

  saveSchedule(schedule: Schedule2): Observable<Schedule2> {
    let url = this.apiUrl;
    if (schedule.id) {
      return this.http.put<Schedule2>(url, schedule);
    } else {
      return this.http.post<Schedule2>(url, schedule);
    }
  }

  getPeriodSchedules(date1: string, date2: string): Observable<Schedule2[]> {
    let url = this.apiUrl + 'period/'
    let params = new HttpParams();
    params = params.append('date1', date1);
    params = params.append('date2', date2);
    return this.http.get<Schedule2[]>(url, {params: params});
  }

  getPeriodSchedulesByUserId(date1: string, date2: string, userId: number): Observable<Schedule2[]> {
    let url = `${this.apiUrl}period/user/${userId}?date1=${date1}&date2=${date2}`;
    return this.http.get<Schedule2[]>(url);
  }


}