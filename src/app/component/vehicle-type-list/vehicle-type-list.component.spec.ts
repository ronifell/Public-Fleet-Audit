import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VehicleTypeListComponent } from './vehicle-type-list.component';
import { GettersService } from 'src/app/service/getters.service';
import { StoragesService } from 'src/app/service/storages.service';
import { Router } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';


describe('VehicleTypeListComponent', () => {
  let component: VehicleTypeListComponent;
  let fixture: ComponentFixture<VehicleTypeListComponent>;
  let gettersService: GettersService;
  let storagesService: StoragesService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleTypeListComponent ],
      imports: [ HttpClientTestingModule, NzGridModule, NzInputModule ], 
      providers: [ GettersService, StoragesService, Router ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call get method on init', () => {
    const getSpy = spyOn(component, 'get');
    component.ngOnInit();
    expect(getSpy).toHaveBeenCalled();
  });
  
});