import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NzGridModule } from 'ng-zorro-antd/grid'; 
import { NzInputModule } from 'ng-zorro-antd/input'; 
import { BrandsListComponent } from './brands-list.component';

describe('BrandsListComponent', () => {
  let component: BrandsListComponent;
  let fixture: ComponentFixture<BrandsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BrandsListComponent],
      imports: [HttpClientTestingModule, NzGridModule, NzInputModule] 
    });
    fixture = TestBed.createComponent(BrandsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});