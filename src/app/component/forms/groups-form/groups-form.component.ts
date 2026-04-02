import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Group } from 'src/app/model/group';
import { GroupsService } from 'src/app/service/groups.service';
import { Permission } from 'src/app/model/permission';
import { PermissionService } from 'src/app/service/permission.service';
import { StoragesService } from 'src/app/service/storages.service';

@Component({
  selector: 'app-groups-form',
  templateUrl: './groups-form.component.html',
  styleUrls: ['./groups-form.component.css']
})
export class GroupsFormComponent implements OnInit{
  
  constructor (
    private formBuilder: FormBuilder,
    private service: GroupsService,
    private router: Router,
    private route: ActivatedRoute,
    private permissionService: PermissionService,
    private storageService: StoragesService
  ) { }
  
  group: Group = <Group>{};
  permissions: Permission[] = [];
  groupPermissions: Permission[] = [];
  checkboxStates: boolean[] = [];
  id: string | null = '';

  ngOnInit(): void {
    this.getPermissions();
    this.id = this.route.snapshot.queryParamMap.get('id');

    if (this.id) {
      this.group = this.storageService.getSession('groupEdit')
      this.groupPermissions = this.group.permissions;

      this.validateForm.patchValue({
        name: this.group.name,
        description: this.group.description
      })
    }
  }

  validateForm: FormGroup<{
    name: FormControl<string | null>;
    description: FormControl<string | null>;
  }> = this.formBuilder.group({
    name: this.formBuilder.control<string | null>(null, Validators.required),
    description: this.formBuilder.control<string | null>(null, Validators.required),
  })

  validInput(group: Group) {
    group = this.id ? this.putGroups(group) : this.postGroups(group);
    this.group.permissions = this.groupPermissions;

    this.service.save(group).subscribe({
      complete: () => {
        this.router.navigate(['admin/permissions'])
      }
    });
  }

  putGroups(group: Group) {
    group.id = this.group.id;
    return group;
  }

  postGroups(group: Group) {
    return group;
  }


  getPermissions() {
    this.permissionService.getAll().subscribe({
      next: (permission: Permission[]) => this.permissions = permission,
      complete: () => {
        this.checkboxStates = new Array(this.permissions.length).fill(false)
        this.userPermissionCheck()
      }
    });
  }

  userPermissionCheck() {
    this.group.permissions.forEach(element => {
      this.permissions.forEach((permission, index) => {
        if (element.id === permission.id) {
          this.checkboxStates[index] = true;
        }
      });
    });
  }

  // userPermissionsCheck(permission: Permission, index: number) {
  //   this.group.permissions.forEach(element => {
  //     if (element.id === permission.id) {
  //       this.checkboxStates[index] = true;
  //     }
  //   });
  //   console.log('entrou')
  // }

  addPermission(permission: Permission, index: number) {
    this.checkboxStates[index] = !this.checkboxStates[index];
    if (this.checkboxStates[index] === true) {
      this.groupPermissions.push(permission);
    }
    else {
      this.groupPermissions = this.groupPermissions.filter(p => p.id !== permission.id);
    }
    

  }

}
