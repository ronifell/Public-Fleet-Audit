import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/service/user.service';
import { StoragesService } from 'src/app/service/storages.service';
import { Router } from '@angular/router';
import { PageRequest } from 'src/app/model/page-request';
import { PageResponse } from 'src/app/model/page-response';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit{

  constructor(
    private storageService: StoragesService,
    private router: Router,
    private service: UserService
  ) { }

  userList: User[] = Array<User>();
  pageRequest: PageRequest = new PageRequest();
  pageResponse: PageResponse<User> = <PageResponse<User>>{};

  ngOnInit(): void {
    this.get();
  }

  get(): void {
    this.service.getAll().subscribe({
      next: (response: User[]) => {
        this.userList = response;
      }
    });
  }

  // Tag Color -----------------------------------------------------------------

  tagColor(tagValue: string): string {
    if (tagValue === 'AVAILABLE') {
      return 'success';
    }
    return 'default';
  }

  // Translate Status ----------------------------------------------------------

  translateStatus(status: string): string {
    if (status === 'AVAILABLE') {
      return 'Disponivel';
    }
    return 'Indisponivel';
  }


  // User Edit -----------------------------------------------------------------
  goToItem(user: User) {
    this.storageService.setSession('userEdit', user);
    this.router.navigate(['/user/edit'], {queryParams: {id: user.id}});
  }

}
