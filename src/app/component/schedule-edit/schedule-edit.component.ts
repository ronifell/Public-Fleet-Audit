import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoragesService } from 'src/app/service/storages.service';
import { Schedule } from 'src/app/model/schedule';
import { SchedulingService } from 'src/app/service/scheduling.service';
import { VehicleTravel } from 'src/app/model/vehicle-travel';


@Component({
  selector: 'app-schedule-edit',
  templateUrl: './schedule-edit.component.html',
  styleUrls: ['./schedule-edit.component.css']
})
export class ScheduleEditComponent implements OnInit{

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StoragesService,
    private service: SchedulingService
  ) {}
  
  schedule: Schedule = <Schedule>{};
  id: string | null = '';
  
  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');

    if (this.id) {
      this.schedule = this.storageService.getSession("scheduleEdit");
    }
  }

}
