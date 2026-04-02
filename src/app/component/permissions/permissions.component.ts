import { Component, OnInit } from '@angular/core';
import { StoragesService } from 'src/app/service/storages.service';
import { Group } from 'src/app/model/group';
import { GroupsService } from 'src/app/service/groups.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit{

  isAdmin: boolean = false;
  showGroups: boolean = false;
  postGroups: boolean = false;
  putGroups: boolean = false;
  delGroups: boolean = false;
  
  constructor(
    private service: GroupsService,
    private storageService: StoragesService,
    private router: Router,
  ) { }

  groups: Group[] = [];

  ngOnInit(): void {
    this.getGroups();
    this.loadPermissions()

  }

  loadPermissions() {
    this.isAdmin = this.checkPermission("ADMIN")
    this.showGroups = this.checkPermission("GROUP_READ")
    this.postGroups = this.checkPermission("GROUP_WRITE")
    this.putGroups = this.checkPermission("GROUP_WRITE")
    this.delGroups = this.checkPermission("GROUP_DELETE")
  }

  getGroups(): void {
    this.service.getAll().subscribe({
      next: (response: Group[]) => this.groups = response
    });
  }

  goToItem(group: Group) {
    this.storageService.setSession('groupEdit', group);
    this.router.navigate(['/admin/permissions/form'], { queryParams: { id: group.id } });
  }

  checkPermission(permission: string): boolean {
    return this.storageService.validateUserPermission(permission);
  }


}
