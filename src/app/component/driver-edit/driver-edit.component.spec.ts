import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DriverEditComponent } from './driver-edit.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTabsModule } from 'ng-zorro-antd/tabs'; 

describe('DriverEditComponent', () => {
  let component: DriverEditComponent;
  let fixture: ComponentFixture<DriverEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DriverEditComponent],
      imports: [
        NzGridModule,
        NzTabsModule 
      ],
    });
    fixture = TestBed.createComponent(DriverEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});