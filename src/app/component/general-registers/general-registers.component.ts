import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Maintenance } from 'src/app/model/maintenance';
import { Supply } from 'src/app/model/supply';
import { RegistersService } from 'src/app/service/registers.service';
import { StoragesService } from 'src/app/service/storages.service';
@Component({
  selector: 'app-general-registers',
  templateUrl: './general-registers.component.html',
  styleUrls: ['./general-registers.component.css']
})
export class GeneralRegistersComponent implements OnInit {

  constructor(
    private service: RegistersService,
    private router: Router,
    private route: ActivatedRoute,
    private storagesService: StoragesService,
  ) {
    this.showMaintenances = false
    this.showSuppliers = false
    this.writeMaintenances = false
    this.writeSuppliers = false
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.loadTabs();
    
    if (this.showMaintenances)
          this.getMaintenances();
    if (this.showSuppliers)
          this.getSupplies();
  }

  uploading: boolean = false;
  maintenances: Maintenance[] = [];
  supplies: Supply[] = [];
  showMaintenances: boolean = false;
  showSuppliers: boolean = false;
  writeMaintenances: boolean = false;
  writeSuppliers: boolean = false;
  tabs = [
    {
      name: '',
      disabled: false,
      icon: ""
    },
  ];

  visible = false;
  size: 'large' | 'default' = 'default';

  get title(): string {
    return `${this.size} Drawer`;
  }

  showDefault(): void {
    this.size = 'default';
    this.open();
  }

  showLarge(): void {
    this.size = 'large';
    this.open();
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  getSupplies() {
    this.service.getSupplies().subscribe({
      next: (response: Supply[]) => {
        this.supplies = response;
      }
    });
  }
  getMaintenances() {
    this.service.getMaintenances().subscribe({
      next: (response: Maintenance[]) => {
        this.maintenances = response;
      }
    })
  }

  goToItem(path: string) {
    this.router.navigate([path], { relativeTo: this.route })
  }

  editItem(item: Maintenance | Supply, path: string) {
    this.storagesService.setSession("registerEdit", item)
    this.router.navigate([path], { queryParams: { id: item.id }, relativeTo: this.route })
  }

  loadPermissions() {
    this.showMaintenances = this.checkPermission("MAINTENANCE_READ")
    this.writeMaintenances = this.checkPermission("MAINTENANCE_WRITE")
    this.showSuppliers = this.checkPermission("SUPPLY_READ")
    this.writeSuppliers = this.checkPermission("SUPPLY_WRITE")
  }

  loadTabs() {
    this.tabs = []
    if (this.showMaintenances) {
      this.tabs.push({
        name: 'Manutenção',
        disabled: false,
        icon: "tool"
      })
    }
    if (this.showSuppliers) {
      this.tabs.push({
        name: 'Abastecimento',
        disabled: false,
        icon: "car"
      })
    }
  }

  checkPermission(permission: string): boolean {
    return this.storagesService.validateUserPermission(permission);
  }

}
