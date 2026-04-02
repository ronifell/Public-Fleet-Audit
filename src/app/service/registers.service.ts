import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PageRequest } from '../model/page-request';
import { Supply } from '../model/supply';
import { Maintenance } from '../model/maintenance';
import { VehicleType } from '../model/vehicle-type';

@Injectable({
  providedIn: 'root'
})
export class RegistersService {

  constructor(private http: HttpClient) { }

  apiUrl: string = environment.API_URL + '/';

  getSupplies(pageRequest?: PageRequest): Observable<Supply[]> {
  let url = this.apiUrl + 'supply/';
  if(pageRequest) {
    url += "?page=" + pageRequest.page + "&size=" + pageRequest.size;
  }
    return this.http.get<Supply[]>(url);
  }

  getMaintenances(pageRequest?: PageRequest): Observable<Maintenance[]> {
  let url = this.apiUrl + 'maintenance/';
  if(pageRequest) {
    url += "?page=" + pageRequest.page + "&size=" + pageRequest.size;
  }
    return this.http.get<Maintenance[]>(url);
  }

  generateReports(
    date1: string, date2: string, 
    vehiclePlate?: string, type?: VehicleType
  ) {
    let url = this.apiUrl + 'report/'

    let params = new HttpParams();
    params = params.append('date1', date1);
    params = params.append('date2', date2);

    if(vehiclePlate){
      url += "vehicle"
      params = params.append('vehiclePlate', vehiclePlate);
    } else if(type) {
      url += "type"
      params = params.append('typeId', type.id);
      params = params.append('typeName', type.name);
    }

    return this.http.get(url, {responseType: 'blob', params: params}).subscribe(response => {
      let blob = new Blob([response], { type: 'application/pdf' });
      let pdfUrl = window.URL.createObjectURL(blob);

      var PDF_link = document.createElement('a');
      PDF_link.href = pdfUrl;
    //   TO OPEN PDF ON BROWSER IN NEW TAB
      window.open(pdfUrl, '_blank');
    //   TO DOWNLOAD PDF TO YOUR COMPUTER
      // PDF_link.download = "TestFile.pdf";
      // PDF_link.click();
    })
  }

  private abrirPdf(url: string, params: HttpParams): void {
    this.http.get(url, { responseType: 'blob', params }).subscribe(response => {
      const pdfUrl = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
      window.open(pdfUrl, '_blank');
    });
  }

  gerarRelatorioSead(mes: string): void {
    const params = new HttpParams().append('mes', mes);
    this.abrirPdf(this.apiUrl + 'glosa/relatorio/sead', params);
  }

  gerarRelatorioCge(mes: string): void {
    const params = new HttpParams().append('mes', mes);
    this.abrirPdf(this.apiUrl + 'glosa/relatorio/cge', params);
  }

  gerarRelatorioTce(mes: string): void {
    const params = new HttpParams().append('mes', mes);
    this.abrirPdf(this.apiUrl + 'glosa/relatorio/tce', params);
  }

}
