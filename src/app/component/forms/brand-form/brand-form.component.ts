import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Brand } from 'src/app/model/brand';
import { AdminInputsService } from 'src/app/service/admin-inputs.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-brand-form',
  templateUrl: './brand-form.component.html',
  styleUrls: ['./brand-form.component.css']
})
export class BrandFormComponent implements OnInit {
  
  constructor(
    private formBuilder: FormBuilder,
    private service: AdminInputsService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StoragesService,
  ) { }

  brand: Brand = <Brand>{};
  id: string | null = '';
  
  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');
    if (this.id) {
      this.brand = this.storageService.getSession('brandEdit');
      this.validateForm.patchValue(this.brand)
    }
  }

  validateForm = this.formBuilder.group({
      id: this.formBuilder.control<number | null>(null),
      name: this.formBuilder.control<string | null>(null, Validators.required)
  })

  validInput(brand: Brand) {
    this.brand = brand;
    this.service.saveBrand(this.brand).subscribe({
      complete: () => this.router.navigate(['../'], {relativeTo: this.route})
    });
  }

}
