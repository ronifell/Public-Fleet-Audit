import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltersAndSearchComponent } from './filters-and-search.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover'; 

describe('FiltersAndSearchComponent', () => {
  let component: FiltersAndSearchComponent;
  let fixture: ComponentFixture<FiltersAndSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FiltersAndSearchComponent],
      imports: [
        NzGridModule,
        NzInputModule,
        NzButtonModule,
        NzPopoverModule 
      ] 
    });
    fixture = TestBed.createComponent(FiltersAndSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});