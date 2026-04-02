import { Component, OnInit, ViewChild, ElementRef, Type } from '@angular/core';
import { User } from 'src/app/model/user';
import { ActivatedRoute } from '@angular/router';
import { StoragesService } from 'src/app/service/storages.service';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { GettersService } from 'src/app/service/getters.service';
import { UserService } from 'src/app/service/user.service';
import { NzStatus } from 'ng-zorro-antd/core/types';
import { Group } from 'src/app/model/group';
import { GroupsService } from 'src/app/service/groups.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})

export class UserFormComponent implements OnInit{
  
  constructor (
    private formBuilder: FormBuilder,
    private service: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StoragesService,
    private gettersService: GettersService,
    private groupsService: GroupsService,

  ) { }

  user: User = <User>{};
  id: string | null = '';
  user_groups: Group[] = [];
  groups: Group[] = Array<Group>();
  edit_password: boolean = false;
  oldpassword_input_validate: NzStatus = '';
  isAdmin: boolean = false;
  passwordVisible = false;
  password?: string;
  confirmPasswordVisible = false;

  
  ngOnInit(): void {
    this.getGroups();

    this.isAdmin = this.storageService.validateUserPermission("ADMIN");

    this.id = this.route.snapshot.queryParamMap.get('id');

    if (this.id) {
      this.user = this.storageService.getSession('userEdit');
      this.user.groups.forEach(element => {
        if (element.id == 1){
          this.isAdmin = true;
        }
      });
      
      const user_groups = (userGroups: Group[]) => {
        this.user_groups = userGroups;
      }
      user_groups(this.user.groups);
      

      this.validateForm.patchValue({
        userName: this.user.userName,
        fullName: this.user.fullName,
        registrationNumber: this.user.registrationNumber,
        groups: this.user.groups
        
      })
    }
  }

  confirmationValidator: ValidatorFn = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  validateForm = this.formBuilder.group({
    userName: this.formBuilder.control<string | null>(null, Validators.required),
    fullName: this.formBuilder.control<string | null>(null, Validators.required),
    password: this.formBuilder.control<string | null>(null, (this.edit_password === true) ? Validators.required : null),
    confirm: this.formBuilder.control<string | null>(null, [this.confirmationValidator]),
    registrationNumber: this.formBuilder.control<string | null>(null),
    // groups: this.formBuilder.control<Group[] | null>(null, Validators.required)
    groups: this.formBuilder.control<Group[] | null>(null)
    // groups: [this.user_groups[0].name]
  })



  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.validateForm.controls.confirm.updateValueAndValidity());
  }
  
  @ViewChild('oldpassword', { static: false }) oldpassword?: ElementRef;

  validInput(user: User) {
    user = this.id ? this.putUser(user) : this.postUser(user);

    if (this.editPermissions.length > 0) {
      this.user.groups.filter((el) => {
        this.editPermissions.filter((el2) => {
          if(el.id === el2.id){
            this.user.groups.splice(this.user.groups.indexOf(el2), 1);
          }
        })
      })
      
    }

    
    if (this.edit_password === true) { 
      let oldPasswordValue = this.oldpassword?.nativeElement.value;
      if (oldPasswordValue.length <= 0) {
        this.oldpassword_input_validate = 'error';
      }
      else {
        this.oldpassword_input_validate = ''
      }

      user.password = oldPasswordValue;
      this.service.comparePasswords(user).subscribe({
        next: (response: boolean) => {
          
          if (response === true) {
            user.password = this.validateForm.get('password')?.value as string;
            

            this.saveUser(user);
          }
        }
      });
    }
    else {
      this.saveUser(user);
    }
  }

  saveUser(user: User) {
    this.service.save(user).subscribe({
      next: (response: User) => {
        
      },
      complete: () => {
        this.router.navigate(['/user'])
      }
    })
  }

  putUser(user: User) {
    user.id = this.user.id;
    user.status = this.user.status;
    user.active = this.user.active;
    return user;
  }
  postUser(user: User) {
    user.status = "AVAILABLE";
    user.active = true;
    return user;
  }

  //Permissions -------------------------
  listOfSelectedValue = ['teste1', 'teste2'];
  optionValue: Group[] = [];
  editTag = false;
  editPermissions: Group[] = []

  onClosePermission(permission: Group){
    this.editPermissions.push(permission);
    this.getGroups();
  }
  
  getGroups(): void {
    this.groupsService.getAll().subscribe({
      next: (response: Group[]) => {
        this.groups = response;
        
        this.removeEqualsGroups();
      }
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

  removeEqualsGroups(): void {
    this.groups = this.groups.filter((el) => {
      return !this.user.groups.some((f) => {
        return el.id === f.id;
      });
    });
    this.editPermissions.forEach(element => {
      this.groups.push(element);
    });
  }

  updateGroupUser(user: User) {
    this.service.save(user).subscribe({
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
