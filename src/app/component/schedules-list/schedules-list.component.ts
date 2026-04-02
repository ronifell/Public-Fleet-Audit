import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Schedule } from 'src/app/model/schedule';
import { User } from 'src/app/model/user';
import { SchedulingService } from 'src/app/service/scheduling.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-schedules-list',
  templateUrl: './schedules-list.component.html',
  styleUrls: ['./schedules-list.component.css']
})
export class SchedulesListComponent implements OnInit {

  isAdmin: boolean = false;
  user: User = <User>{};
  addButton: boolean = false;
  schedulesList: Schedule[] = [];
  constructor(
    private service: SchedulingService,
    private storageService: StoragesService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getUser()
    this.isAdmin = this.storageService.validateUserPermission("ADMIN")
    if(this.isAdmin)
      this.get();
    else

    this.addButton = this.storageService.validateUserPermission('VEHICLE_WRITE');
  }

  get(): void {
    this.service.getSchedules().subscribe({
      next: (response: Schedule[]) => this.schedulesList = response
    });
  }

  colorStatus(): void {
    const status = document.querySelector<HTMLElement>('class.value2');
    if(status?.innerText == 'AVAILABLE'){
      status.style.backgroundColor = 'green';
    }
  }

  goToItem(schedule: Schedule) {
    if(!this.addButton)
      return;
    this.storageService.setSession('scheduleEdit', schedule);
    this.router.navigate(['/schedules/edit'], {queryParams: {id: schedule.id}});
  }

}
