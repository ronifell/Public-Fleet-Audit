import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoragesService } from 'src/app/service/storages.service';
import { User } from 'src/app/model/user';
import { Group } from 'src/app/model/group';
import { GroupsService } from 'src/app/service/groups.service';
import { AdminInputsService } from 'src/app/service/admin-inputs.service';
import { Permission } from 'src/app/model/permission';
import { PermissionService } from 'src/app/service/permission.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit{

  user: User = <User>{};
  user_groups: Group[] = [];
  groups: Group[] = Array<Group>();
  allPermissions: Permission[] = [];
  optionPermissionValue: Permission[] = Array<Permission>();
  isAdmin = false;

  id: string | null = '';
  
  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StoragesService,
    private groupsService: GroupsService,
    private permissionsService: PermissionService,
    private service: AdminInputsService
  ) {}

  ngOnInit(): void {
    this.getGroups();
    this.getPermissions();
    
    this.id = this.route.snapshot.queryParamMap.get('id');

    if (this.id) {
      this.user = this.storageService.getSession("userEdit");
      this.user.groups.forEach(element => {
        if (element.id == 1) {
          this.isAdmin = true;
        }
      });
    }

  }

  getPermissions(): void {
    this.permissionsService.getAll().subscribe({
        next: (response: Permission[]) => {
            this.allPermissions = response.filter(p => 
                !this.user.permissions.some(up => up.id === p.id)
            );
        }
    });
  }

  getGroups(): void {
    this.groupsService.getAll().subscribe({
      next: (response: Group[]) => {
        this.groups = response;
        this.removeEqualsGroups();
      }
    });
  }

  goToItem(user: User) {
    this.storageService.setSession('userEdit', user);
    this.router.navigate(['/user/form'], {queryParams: {id: user.id}});
  }

  //Group add ------------------------------------------------------------------
  listOfSelectedValue = [];
  optionValue: Group[] = [];
  editTag = false;

  removeEqualsGroups(): void {
    this.groups = this.groups.filter((el) => {
      return !this.user.groups.some((f) => {
        return el.id === f.id;
      });
    });
  }

  editTags(): void {
    this.editTag = !this.editTag;
  }

  editGroup(group: Group) {
    this.user.groups.filter((el) => {
      if (el.id === group.id) {
        this.user.groups.splice(this.user.groups.indexOf(el), 1);
      }
    });
    this.updateGroupUser(this.user);
  }

  updateGroupUser(user: User) {
    this.service.saveUser(user).subscribe({
      complete: () => {
        this.storageService.setSession("userEdit", user)
        this.getGroups();
      }
    })
  }

  addUserGroup(): void {
    this.optionValue.forEach(element => {
      this.user.groups.push(element);
    });
    this.optionValue = [];
    this.updateGroupUser(this.user);
  }

}
