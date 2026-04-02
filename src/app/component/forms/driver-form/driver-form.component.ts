import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Driver } from 'src/app/model/driver';
import { EDriverStatus } from 'src/app/model/enums/e-driver-status';
import { ELicenseCategory } from 'src/app/model/enums/e-license-category';
import { DatePipe } from '@angular/common';
import { DriverService } from 'src/app/service/driver.service';
import { StoragesService } from 'src/app/service/storages.service';
import { GettersService } from 'src/app/service/getters.service';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-driver-form',
  templateUrl: './driver-form.component.html',
  styleUrls: ['./driver-form.component.css'],
  providers: [DatePipe]
})
export class DriverFormComponent implements OnInit {

  licenseOptions = Object.entries(ELicenseCategory).map(e => ({ label: e[1], value: e[0] }));
  isFirstPage: boolean = true;
  pageIndex: number = 0;

  driver: Driver = <Driver>{};
  removedPhones: any[] = [];

  models: Driver[] = new Array<Driver>();
  modelsOptions: any = [];

  isAdmin: boolean = false;

  id: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private service: DriverService,
    private storageService: StoragesService,
    private gettersService: GettersService,
  ) { }
  ngOnInit(): void {
    this.isAdmin = this.storageService.validateUserPermission("ADMIN");

    this.id = this.route.snapshot.queryParamMap.get('id');

    if (this.id) {

      this.validateForm.get('birthDate')?.disable();
      this.validateForm.get('gender')?.disable();
      this.validateForm.get('cpf')?.disable();
      this.validateForm.get('rg')?.disable();
      this.validateForm.get('nationality')?.disable();
      this.validateForm.get('naturality')?.disable();
      this.validateForm.get('licenseIssueDate')?.disable();

      this.driver = this.storageService.getSession("driverEdit")

      this.validateForm.patchValue(this.driver);

      this.createArray();
    }
    this.validateForm.get('licenseIssueDate')?.setValidators([Validators.required, this.validateLicenseIssueDate.bind(this)]);
    this.validateForm.get('licenseIssueDate')?.updateValueAndValidity();
    this.validateForm.get('licenseExpireDate')?.setValidators([Validators.required, this.validateLicenseExpireDate.bind(this)]);
    this.validateForm.get('licenseExpireDate')?.updateValueAndValidity();
  }

  validateForm = this.formBuilder.group({
    id: this.formBuilder.control<number | null>(null),
    name: this.formBuilder.control<string | null>(null, Validators.required),
    birthDate: this.formBuilder.control<string | null>(null, [Validators.required, this.birthDateValidator]),
    gender: this.formBuilder.control<string | null>(null, Validators.required),
    cpf: this.formBuilder.control<string | null>(null, Validators.required),
    rg: this.formBuilder.control<string | null>(null, Validators.required),
    nationality: this.formBuilder.control<string | null>(null, Validators.required),
    naturality: this.formBuilder.control<string | null>(null, Validators.required),
    phones: this.formBuilder.array([]),
    email: this.formBuilder.control<string | null>(null, Validators.required),
    licenseNumber: this.formBuilder.control<string | null>(null, Validators.required),
    licenseIssueDate: this.formBuilder.control<string | null>(null, Validators.required),
    licenseExpireDate: this.formBuilder.control<string | null>(null, Validators.required),
    licenseIssuingBody: this.formBuilder.control<string | null>(null, Validators.required),
    licenseCategory: this.formBuilder.control<string | null>(null, Validators.required),
  })

  get phones() {
    return this.validateForm.get('phones') as FormArray;
  }

  birthDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value) {
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() - ((today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) ? 1 : 0);

      if (age < 18) {
        return { 'underAge': true };
      }
    }

    return null;
  }

  validateLicenseIssueDate(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      const selectedDate = new Date(control.value);
      const today = new Date();

      if (selectedDate > today) {
        return { 'futureDate': true };
      }
    }

    return null;
  }

  validateLicenseExpireDate(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      const selectedDate = new Date(control.value);
      const today = new Date();

      if (selectedDate < today) {
        return { 'pastDate': true };
      }
    }

    return null;
  }

  addField() {
    const phoneGroup = this.formBuilder.group({
      phone: ['', {
        validators: Validators.required
      }],
      description: ''
    })
    this.phones.push(phoneGroup);
  }

  removePhone(index: number) {
    if (this.phones.at(index).value.id != null) {
      let value = this.phones.at(index).value
      this.removedPhones.push(value);
    }
    this.phones.removeAt(index);
  }

  createArray() {
    for (let phone of this.driver.phones) {
      let phoneGroup = this.formBuilder.group({
        id: phone.id,
        phone: [phone.phone, {
          validators: Validators.required
        }],
        description: [phone.description, {
          validators: Validators.required
        }]
      })
      this.phones.push(phoneGroup);
    }
  }

  validInput(driver: Driver) {
    driver = this.id ? this.putDriver(driver) : this.postDriver(driver)

    this.driver = driver;
    this.driver.birthDate = this.datePipe.transform(this.driver.birthDate, "yyyy-MM-dd")!
    this.driver.licenseIssueDate = this.datePipe.transform(this.driver.licenseIssueDate, "yyyy-MM-dd")!
    this.driver.licenseExpireDate = this.datePipe.transform(this.driver.licenseExpireDate, "yyyy-MM-dd")!
    this.driver.status = EDriverStatus.AVAILABLE;

    if (this.removedPhones.length > 0) {
      this.service.deletePhone(this.removedPhones).subscribe({
        complete: () => {
          this.saveDriver();
        }
      })
    }
    else {
      this.saveDriver();
    }

  }

  saveDriver() {
    this.service.save(this.driver).subscribe({
      complete: () => {
        this.router.navigate(['/driver'])
      }
    })
  }

  putDriver(driver: Driver) {
    driver.id = this.driver.id;
    driver.birthDate = this.driver.birthDate;
    driver.gender = this.driver.gender;
    driver.cpf = this.driver.cpf;
    driver.rg = this.driver.rg;
    driver.nationality = this.driver.nationality;
    driver.naturality = this.driver.naturality;
    driver.licenseIssueDate = this.driver.licenseIssueDate;

    return driver;
  }

  postDriver(driver: Driver) {
    return driver
  }

  setModelsOptions() {
    this.modelsOptions = this.models.map(model => ({
      label: model.name, value: model
    }))
  }


  onIndexChange(index: number): void {
    this.isFirstPage = !this.isFirstPage;
    this.pageIndex = index;
  }


}
