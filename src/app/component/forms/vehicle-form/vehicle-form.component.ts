import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Brand } from 'src/app/model/brand';
import { CarModel } from 'src/app/model/car-model';
import { Driver } from 'src/app/model/driver';
import { EVehicleStatus } from 'src/app/model/enums/e-vehicle-status';
import { Fuel } from 'src/app/model/fuel';
import { Vehicle } from 'src/app/model/vehicle';
import { VehicleType } from 'src/app/model/vehicle-type';
import { DriverService } from 'src/app/service/driver.service';
import { GettersService } from 'src/app/service/getters.service';
import { StoragesService } from 'src/app/service/storages.service';
import { VehicleService } from 'src/app/service/vehicle.service';

@Component({
    selector: 'app-vehicle-form',
    templateUrl: './vehicle-form.component.html',
    styleUrls: ['./vehicle-form.component.css'],
    providers: [DatePipe]
})

export class VehicleFormComponent implements OnInit {

    vehicle: Vehicle = <Vehicle>{};

    typesList: VehicleType[] = [];
    modelsList: CarModel[] = [];
    brandList: Brand[] = [];
    driversList: Driver[] = [];

    fuelsList: Fuel[] = [];
    selectedFuels: Fuel[] = [];

    lastSelectedDriver: Driver | null = null;

    isCheckedButton: boolean = false;
    isAdmin: boolean = false;
    rentedVehicle: boolean = false;

    id: string | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private gettersService: GettersService,
        private service: VehicleService,
        private datePipe: DatePipe,
        private router: Router,
        private route: ActivatedRoute,
        private storageService: StoragesService,
        private driverService: DriverService,
    ) { }

    ngOnInit(): void {
        this.getFuelsList();

        this.isAdmin = this.storageService.validateUserPermission("ADMIN");

        this.id = this.route.snapshot.queryParamMap.get('id');
        if (this.id) {
            this.setFormValues();
            this.createArray();
        } else {
            this.getBrandsList();
            this.getTypesList();
            this.getDriversList()
            this.addField();
        }

        const manufacturingDateControl = this.validateForm.get('manufacturingDate');
        const purchaseDateControl = this.validateForm.get('purchaseDate');

        if (manufacturingDateControl && purchaseDateControl) {
            const currentDate = new Date();
            manufacturingDateControl.setValidators([
                Validators.required,
                this.dateValidator(currentDate),
            ]);

            purchaseDateControl.setValidators([
                Validators.required,
                this.dateValidator(currentDate),
                this.dateComparisonValidator(manufacturingDateControl),
            ]);

            manufacturingDateControl.updateValueAndValidity();
            purchaseDateControl.updateValueAndValidity();
        }
    }

    dateValidator(currentDate: Date): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const selectedDate = new Date(control.value);
            return selectedDate > currentDate ? { 'invalidDate': true } : null;
        };
    }

    dateComparisonValidator(referenceControl: AbstractControl): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const selectedDate = new Date(control.value);
            const referenceDate = new Date(referenceControl.value);
            return selectedDate < referenceDate ? { 'invalidComparison': true } : null;
        };
    }

    setRentValidators() {
        if (this.rentedVehicle) {
            this.validateForm.get('fixedDriver')?.enable();
            this.validateForm.controls['fixedDriver'].setValidators([Validators.required]);
            this.validateForm.patchValue({ fixedDriver: this.lastSelectedDriver })
        } else {
            this.validateForm.get('fixedDriver')?.disable();
            this.validateForm.controls['fixedDriver'].clearValidators();
            this.validateForm.patchValue({ fixedDriver: null })
        }
        this.validateForm.controls['fixedDriver'].updateValueAndValidity();
    }

    setFormValues() {
        this.vehicle = this.storageService.getSession("vehicleEdit");

        this.validateForm.get('rented_vehicle')?.disable();

        this.modelsList.push(this.vehicle.carModel);
        this.typesList.push(this.vehicle.type);
        this.brandList.push(this.vehicle.carModel.brand);

        this.fuelsList = this.vehicle.fuels

        if (this.vehicle.fixedDriver != null) {
            this.rentedVehicle = true;
            this.validateForm.patchValue({ rented_vehicle: true });
            this.driversList.push(this.vehicle.fixedDriver);
            this.setRentValidators();
        }

        this.validateForm.get('carModel')?.disable();
        this.validateForm.get('brand')?.disable();
        this.validateForm.get('type')?.disable();
        this.validateForm.get('chassi')?.disable();
        this.validateForm.get('renavam')?.disable();
        this.validateForm.get('manufacturingDate')?.disable();
        this.validateForm.get('purchaseDate')?.disable();
        this.validateForm.get('acquisitionProcessNumber')?.disable();

        this.validateForm.patchValue({
            patrimony: this.vehicle.patrimony,
            brand: this.vehicle.carModel.brand,
            type: this.vehicle.type,
            carModel: this.vehicle.carModel,
            licensePlate: this.vehicle.licensePlate,
            passengersAmount: this.vehicle.passengersAmount,
            chassi: this.vehicle.chassi,
            renavam: this.vehicle.renavam,
            manufacturingDate: this.vehicle.manufacturingDate,
            purchaseDate: this.vehicle.purchaseDate,
            drivenQuilometers: this.vehicle.drivenQuilometers,
            acquisitionProcessNumber: this.vehicle.acquisitionProcessNumber,
            fuels: this.vehicle.fuels,
            fixedDriver: this.vehicle.fixedDriver,
        })
    }

    validateForm = this.formBuilder.group({
        type: this.formBuilder.control<VehicleType | null>(null, Validators.required),
        brand: this.formBuilder.control<Brand | null>(null),
        carModel: this.formBuilder.control<CarModel | null>(null, Validators.required),
        licensePlate: this.formBuilder.control<string>(''),
        passengersAmount: this.formBuilder.control<number | null>(null, Validators.required),
        chassi: this.formBuilder.control<string>(''),
        renavam: this.formBuilder.control<string>(''),
        manufacturingDate: this.formBuilder.control<string>('', Validators.required),
        purchaseDate: this.formBuilder.control<string>('', Validators.required),
        patrimony: this.formBuilder.control<number | null>(null, Validators.required),
        drivenQuilometers: this.formBuilder.control<number | null>(null, Validators.required),
        acquisitionProcessNumber: this.formBuilder.control<number | null>(null, Validators.required),
        fuels: this.formBuilder.array([], Validators.required),

        rented_vehicle: this.formBuilder.control<boolean>(this.rentedVehicle),

        fixedDriver: this.formBuilder.control<Driver>({ value: <Driver>{}, disabled: !this.rentedVehicle }),
    })

    validInput(formVehicle: Vehicle) {
        formVehicle = this.id ? this.putVehicle(formVehicle) : this.postVehicle(formVehicle)
        formVehicle.status = EVehicleStatus.AVAILABLE;
        if (!this.rentedVehicle) {
            formVehicle.fixedDriver = null;
        }

        formVehicle.fuels = this.selectedFuels

        this.service.save(formVehicle).subscribe({
            complete: () => {
                this.router.navigate(['../'], { relativeTo: this.route });
            }
        })
    }

    putVehicle(formVehicle: Vehicle) {
        formVehicle.id = this.vehicle.id;
        formVehicle.carModel = this.vehicle.carModel;
        formVehicle.type = this.vehicle.type;
        return formVehicle;
    }

    postVehicle(formVehicle: Vehicle) {
        formVehicle.manufacturingDate = this.datePipe.transform(formVehicle.manufacturingDate, "yyyy-MM-dd")!;
        formVehicle.purchaseDate = this.datePipe.transform(formVehicle.purchaseDate, "yyyy-MM-dd")!;
        formVehicle.status = EVehicleStatus.AVAILABLE;
        return formVehicle
    }

    compareFn = (o1: any, o2: any) => (o1 && o2 ? o1.id === o2.id : o1 === o2);

    get fuels() {
        return this.validateForm.get('fuels') as FormArray;
    }

    addField() {
        const fuelGroup = this.formBuilder.group({
            id: [0, {
                validators: Validators.required
            }],
            name: ['', {
                validators: Validators.required
            }]
        })
        this.fuels.push(fuelGroup);
    }

    removeFuel(index: number) {
        if (this.fuels.length == 1)
            return
        this.fuels.removeAt(index);
    }

    createArray() {
        for (let item of this.vehicle.fuels) {
            let itemGroup = this.formBuilder.group({
                id: item.id,
                name: item.name
            })
            this.fuels.push(itemGroup);
        }
    }

    getCarModelsByBrand(brand: Brand) {
        this.gettersService.getCarModelsByBrand(brand.id).subscribe({
            next: (models: CarModel[]) => {
                this.modelsList = models;
            }
        })
    }

    changeBrand(brand: Brand) {
        if (brand == null || brand == undefined) return
        this.getCarModelsByBrand(brand)
    }

    changeDriver(driver: Driver) {
        if (driver == null) return
        this.lastSelectedDriver = driver;
    }

    getTypesList() {
        this.gettersService.getVehicleType().subscribe({
            next: (types: VehicleType[]) => {
                this.typesList = types;
            }
        });
    }

    getBrandsList() {
        this.gettersService.getBrands().subscribe({
            next: (brand: Brand[]) => {
                this.brandList = brand;
            }
        });
    }
    
    getFuelsList() {
        this.gettersService.getFuels().subscribe({
            next: (response: Fuel[]) => this.fuelsList = response
        });
    }

    getDriversList() {
        this.driverService.getNotExclusive().subscribe({
            next: (drivers: Driver[]) => {
                this.driversList = drivers;
            }
        })
    }

    changeDrivers() {
        this.getDriversList();
    }

    checkButton(): void {
        this.rentedVehicle = !this.rentedVehicle;
        this.setRentValidators();
    }

    selectFuel() {
        this.selectedFuels = []
        for (let item of this.fuels.controls.values())
            if (item.value.name != null && item.value.name != undefined) {
                this.selectedFuels.push(item.value.name)
            }
    }
}
