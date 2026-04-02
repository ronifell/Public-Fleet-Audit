import { DatePipe, Time } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Driver } from 'src/app/model/driver';
import { Schedule } from 'src/app/model/schedule';
import { User } from 'src/app/model/user';
import { Vehicle } from 'src/app/model/vehicle';
import { DriverService } from 'src/app/service/driver.service';
import { GettersService } from 'src/app/service/getters.service';
import { SchedulingService } from 'src/app/service/scheduling.service';
import { StoragesService } from 'src/app/service/storages.service';
import { VehicleService } from 'src/app/service/vehicle.service';

@Component({
  selector: 'app-scheduling-form',
  templateUrl: './scheduling-form.component.html',
  styleUrls: ['./scheduling-form.component.css'],
  providers: [DatePipe]
})
export class SchedulingFormComponent implements OnInit {

  vehiclesList: Vehicle[] = [];
  user: User = <User>{};
  selectedVehicles: Vehicle[] = [];
  vehiclesOptions: Vehicle[] = [];

  driversList: Driver[] = [];
  selectedDrivers: Driver[] = [];
  fixedDrivers: Driver[] = [];
  driversOptions: Driver[] = [];

  
  schedule: Schedule = <Schedule>{};
  containDiary: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private service: SchedulingService,
    private driverService: DriverService,
    private vehicleService: VehicleService,
    private gettersService: GettersService,
    private storageService: StoragesService,
    private datePipe: DatePipe,
  ) { }
  ngOnInit(): void {

    this.user = this.storageService.getUser();
    
    this.isAdmin = this.storageService.validateUserPermission("ADMIN");

    // Colocar isso no else dos parametros da rota, 
    // exemplo no formulário de checklist
    this.addField();
  }


  getVehicle(): void {
    this.vehicleService.getAvailable(this.schedule.startDate, this.schedule.endDate!).subscribe({
      next: (response: Vehicle[]) => this.vehiclesList = response,
      complete: () => this.setVehicleOptions()
    });
  }

  getDriver(): void {
    this.driverService.getAvailable(this.schedule.startDate, this.schedule.endDate! ).subscribe({
      next: (response: Driver[]) =>  this.driversList = response, 
      complete: () => this.selectDrivers()
    });
  }

  validateForm = this.formBuilder.group({
    
    startDate: this.formBuilder.control<Date | null>(null, [Validators.required]),
    startTime: this.formBuilder.control<Time | null>(null),
    endDate: this.formBuilder.control<Date | null>(null, [Validators.required]),
    endTime: this.formBuilder.control<Time | null>(null),
    processNumber: this.formBuilder.control<number | null>(null),
    arrival: this.formBuilder.control<string | null>(null),
    departure: this.formBuilder.control<string | null>(null),
    personInChargeName: this.formBuilder.control<string | null>(null),
    personInChargePhone: this.formBuilder.control<number | null>(null),
    plaintiffUnit: this.formBuilder.control<string | null>(null),
    passengersAmount: this.formBuilder.control<number | null>(null, Validators.required),
    status: "AGENDADO",
    requestUser: this.formBuilder.control<User | null>(this.user, Validators.required),

    has_diary: this.formBuilder.control<boolean>(false),
    travelType: this.formBuilder.control<string>('interState'),

    travels: this.formBuilder.array([], Validators.required)

  },
  {
    validators: (formGroup) => {
      const startDate = formGroup.get('startDate')?.value;
      const endDate = formGroup.get('endDate')?.value;

      if (startDate && endDate && startDate > endDate) {
        formGroup.get('endDate')?.setErrors({ dateRange: true });
      } else {
        formGroup.get('endDate')?.setErrors(null);
      }
    }
  })

  get travels() {
    return this.validateForm.get('travels') as FormArray;
  }

  addField() {
    const itemGroup = this.formBuilder.group({
      id: null,
      vehicle: [null, {
        validators: Validators.required
      }],
      driver: [<Driver>{}, {
        validators: Validators.required
      }],
      passengersAmount: [{value: null, disabled: true}, Validators.required],
      status: "AGENDADO",
      diaryValue: [{value: 0, disabled: !this.containDiary}, Validators.required],
      fuel: null,
      departureQuilometers: null,
      arrivalQuilometers: null,
      drivenQuilometers: null,
      usedFuelAmount: null,
      registry: null,
      items: null,
      schedule_id: null,
    })
    this.travels.push(itemGroup);
  }

  removeItem(index: number) {
    if (this.travels.length == 1)
      return
    this.travels.removeAt(index);
  }

  createArray() {
    for (let item of this.schedule.travels) {
      let itemGroup = this.formBuilder.group({
        id: item.id,
        vehicle: [item.vehicle, { validators: Validators.required }],
        driver: [item.driver, { validators: Validators.required }],

        passengersAmount: [item.passengersAmount, { validators: Validators.required }],
        diaryValue: [item.diaryValue],
        status: [item.status],
      })
      this.travels.push(itemGroup);
    }
  }

  validInput(object: Schedule) {
    if (this.schedule.id) object.id = this.schedule.id;
    this.schedule = object;
    this.schedule.startDate = this.datePipe.transform(this.schedule.startDate, "yyyy-MM-dd")!
    this.schedule.endDate = this.datePipe.transform(this.schedule.endDate, "yyyy-MM-dd")!
    for(let travel of this.schedule.travels){
      travel.passengersAmount = travel.vehicle.passengersAmount
      if(travel.vehicle.fixedDriver != null){
        travel.driver = travel.vehicle.fixedDriver;
      }
      if(!this.containDiary)
        travel.diaryValue = 0.0
    }

    this.schedule.requestUser = this.user;
    
    this.saveSchedule();
  }

  saveSchedule() {
    this.service.saveSchedule(this.schedule).subscribe({
      complete: () => {
        this.router.navigate(['../'], {relativeTo: this.route})
      }
    });
  }
  
  setVehicleOptions() {
    this.selectedVehicles = []
    for (let item of this.travels.controls.values())
      this.selectedVehicles.push(item.value.vehicle)
    this.vehiclesOptions = this.vehiclesList.filter(item => !this.selectedVehicles.includes(item))
  }


  selectVehicles(vehicle: Vehicle | null, item: AbstractControl) {
    this.setVehicleOptions()

    if(!vehicle) {
      item.patchValue({
        driver: null,
        passengersAmount: null,
        diaryValue: 0,
      })
      return
    } 
    item.patchValue({ passengersAmount: vehicle.passengersAmount})
    if(vehicle?.fixedDriver != null) {
      this.driversList.push(vehicle.fixedDriver)
      this.selectedDrivers.push(vehicle.fixedDriver)
      item.patchValue({driver: vehicle.fixedDriver})
      if(!this.fixedDrivers.includes(vehicle.fixedDriver))
        this.fixedDrivers.push(vehicle.fixedDriver)
      item.get('driver')?.disable()
    } else {
      item.patchValue({driver: null})
      item.get('driver')?.enable()
    }
  }

  diaryCheck(){
    this.containDiary = !this.containDiary
    for (let item of this.travels.controls.values()){
      let diaryControl = item.get('diaryValue')
      if(this.containDiary) {
        diaryControl?.enable()
        diaryControl?.setValidators([Validators.required])

        let itemVehicle = item.get('vehicle')?.value
      }
      else {
        diaryControl?.disable()
        diaryControl?.clearValidators()
        item.patchValue({ diaryValue: 0 })
      }
      diaryControl?.updateValueAndValidity()
    }
  }

  selectDrivers(driver?: Driver) {
    this.selectedDrivers = []
    if(driver)
      if(!this.driversList.includes(driver))
        return
    for (let item of this.travels.controls.values()){
      if(item.value.driver != null && item.value.driver != undefined)
        this.selectedDrivers.push(item.value.driver)
    }
    this.driversOptions = this.driversList.filter(item => !this.selectedDrivers.includes(item))
  }


  changeStartDate(startDate: Date) {
    this.schedule.startDate = this.datePipe.transform(startDate, "yyyy-MM-dd")!
    this.validateDates()
  }

  changeEndDate(endDate: Date) {
    this.schedule.endDate = this.datePipe.transform(endDate, "yyyy-MM-dd")!
    this.validateDates()
  }

  clearLists() {
    this.vehiclesList = [];
    this.selectedVehicles = [];
    for (let item of this.travels.controls)
      item.patchValue({vehicle: null})
  }

  validateDates() {
    this.clearLists()
    
    if (!this.schedule.startDate || !this.schedule.endDate) return
    if (this.schedule.endDate < this.schedule.startDate) return

    this.getVehicle()
    this.getDriver()
  }
}
