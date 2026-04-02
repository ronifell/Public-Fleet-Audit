import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Vehicle } from 'src/app/model/vehicle';
import { VehicleType } from 'src/app/model/vehicle-type';
import { GettersService } from 'src/app/service/getters.service';
import { RegistersService } from 'src/app/service/registers.service';
import { VehicleService } from 'src/app/service/vehicle.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  providers: [ DatePipe ]
})
export class ReportsComponent implements OnInit{

  selectedVehicle: string | null = null;
  vehicleList: Vehicle[] = Array<Vehicle>();
  vehicleOptions: any;

  selectedVehicleType: VehicleType | null = null;
  vehicleTypeList: VehicleType[] = Array<VehicleType>();
  vehicleTypeOptions: any;

  constructor(
    private formBuilder: FormBuilder,
    private vehicleService: VehicleService,
    private gettersService: GettersService,
    private datePipe: DatePipe,
    private service: RegistersService,
    ) {}

  ngOnInit(): void {
    this.getVehicle();
    this.getVehicleTypes();
  }

  validateForm: FormGroup<{
    startDate: FormControl<string | null>;
    endDate: FormControl<string | null>;
  }> = this.formBuilder.group({
    startDate: this.formBuilder.control<string | null>(null, Validators.required),
    endDate: this.formBuilder.control<string | null>(null, Validators.required),
  },
  {
    validators: (formGroup) => {
      const startDate = formGroup.get('startDate')?.value;
      const endDate = formGroup.get('endDate')?.value;

      if (startDate && endDate && startDate > endDate) {
        formGroup.get('endDate')?.setErrors({ dateRange: true });
      }
    }
  })

  submit(request: any){
    
    let startDate = this.datePipe.transform(request.startDate, "yyyy-MM-dd")!
    let endDate = this.datePipe.transform(request.endDate, "yyyy-MM-dd")!
    if(this.selectedVehicle)
      this.service.generateReports(startDate, endDate, this.selectedVehicle);
    else if(this.selectedVehicleType)
      this.service.generateReports(startDate, endDate, undefined, this.selectedVehicleType);
    else 
      this.service.generateReports(startDate, endDate);
  }

  compareFn = (o1: any, o2: any) => (o1 && o2 ? o1.id === o2.id : o1 === o2);

  getVehicle(): void {
    this.vehicleService.get().subscribe({
      next: (response: Vehicle[]) => {
        this.vehicleList = response;
      }, 
      complete: () => {
        this.setVehicleOptions();
      } 

    });
  }

  setVehicleOptions(){
    this.vehicleOptions = this.vehicleList.map(vehicle => ({
                            label: vehicle.carModel.name + ' - ' + vehicle.licensePlate, value: vehicle.licensePlate})
                          )
  }

  getVehicleTypes() {
    this.gettersService.getVehicleType().subscribe({
      next: (response: VehicleType[]) => {
        this.vehicleTypeList = response;
      }, 
      complete: () => {
        this.setVehicleTypeOptions();
      }
    })
  }

  setVehicleTypeOptions(){
    this.vehicleTypeOptions = this.vehicleTypeList.map(vehicleType => ({
                            label: vehicleType.name, value: vehicleType})
                          )
  }

  onChange(isVehicleChange: boolean) {
    if(!this.selectedVehicle || !this.selectedVehicleType)
      return

    if(isVehicleChange)
      this.selectedVehicleType = null
    else
    this.selectedVehicle = null
  }

  // ── Relatórios Governamentais AP04 ───────────────────────────────────────

  selectedMesGlosa: Date | null = null;

  private getMesFormatado(): string | null {
    if (!this.selectedMesGlosa) return null;
    return this.datePipe.transform(this.selectedMesGlosa, 'yyyy-MM');
  }

  gerarSead(): void {
    const mes = this.getMesFormatado();
    if (mes) this.service.gerarRelatorioSead(mes);
  }

  gerarCge(): void {
    const mes = this.getMesFormatado();
    if (mes) this.service.gerarRelatorioCge(mes);
  }

  gerarTce(): void {
    const mes = this.getMesFormatado();
    if (mes) this.service.gerarRelatorioTce(mes);
  }

}
