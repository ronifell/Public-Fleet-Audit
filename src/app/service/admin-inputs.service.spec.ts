import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 

import { AdminInputsService } from './admin-inputs.service';

describe('AdminInputsService', () => {
  let service: AdminInputsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AdminInputsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});