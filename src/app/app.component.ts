import { Component, Renderer2, ElementRef, HostListener, OnInit } from '@angular/core';
import { User } from './model/user';
import { LoginService } from './service/login.service';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { StoragesService } from './service/storages.service';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    // Drawer
    visible = false;
    open_drawer(): void {
        this.visible = true;
    }
    close_drawer(): void {
        this.visible = false;
    }

    goToItem(user: User) {
        this.storagesService.setSession('userEdit', user);
        this.router.navigate(['/user/edit'], { queryParams: { id: user.id } });
    }

    //--------------------------------

    isCollapsed = false;
    screenWidth: number = window.innerWidth;
    user: User = <User>{};

    currentUrl: string = '';

    isAdmin: boolean = false;
    showVehTypes: boolean = false;
    showBrands: boolean = false;
    showModels: boolean = false;
    showDrivers: boolean = false;
    showVehicles: boolean = false;
    showGroups: boolean = false;
    showReports: boolean = false;
    showMaintenances: boolean = false;
    showSuppliers: boolean = false;
    showSchedules: boolean = true;
    showUsers: boolean = false;
    showFuels: boolean = false;

    isLoading: boolean = true;

    // propriedade para o botão de voltar
    showBackButton = false;

    constructor(
        private router: Router,
        private renderer: Renderer2,
        private el: ElementRef,
        private loginService: LoginService,
        private storagesService: StoragesService,
        private location: Location,
        private http: HttpClient,
    ) {
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.currentUrl = event.url || '';
                const path = (event.urlAfterRedirects || event.url || '').split('?')[0];

                // Define quando mostrar o botão de voltar
                const hiddenRoutes = ['/', '/home', '/login'];
                this.showBackButton =
                    !hiddenRoutes.includes(path) && !path.startsWith('/inova-thec');
            } else if (event instanceof NavigationStart) {
                this.isAdmin = false
                this.showVehTypes = false
                this.showBrands = false
                this.showModels = false
                this.showDrivers = false
                this.showVehicles = false
                this.showGroups = false
                this.showReports = false
                this.showMaintenances = false
                this.showSuppliers = false
                this.showSchedules = false;
                this.showUsers = false
                this.showFuels = false;
                this.loadPermissions()
            }
        });

        this.loginService.authUser.subscribe({
            next: (user: User) => {
                this.user = user;
                this.loadPermissions()
                this.isLoading = false;
            }
        });

    }
    ngOnInit(): void {
        this.isAdmin = this.storagesService.validateUserPermission('ADMIN');
        this.user = this.storagesService.getUser();
        this.loadPermissions()
        this.prefetchAuditData();
    }

    private prefetchAuditData(): void {
        this.http
            .get(`${environment.API_URL}/auditoria/motor`)
            .pipe(
                timeout(6000),
                catchError(() => of(null))
            )
            .subscribe();
    }

    goBack() {
        this.location.back();
    }

    loadPermissions() {
        this.isAdmin = this.checkPermission("ADMIN")
        this.showVehTypes = this.checkPermission("VEHICLE_TYPE_READ")
        this.showBrands = this.checkPermission("BRAND_READ")
        this.showModels = this.checkPermission("CAR_MODEL_READ")
        this.showDrivers = this.checkPermission("DRIVER_READ")
        this.showVehicles = this.checkPermission("VEHICLE_READ")
        this.showGroups = this.checkPermission("GROUP_READ")
        this.showReports = this.checkPermission("REPORT_READ")
        this.showMaintenances = this.checkPermission("MAINTENANCE_READ")
        this.showSuppliers = this.checkPermission("SUPPLY_READ")
        this.showSchedules = this.checkPermission("SCHEDULE_READ")
        this.showUsers = this.checkPermission("USER_READ")
        this.showFuels = this.checkPermission("FUEL_READ")
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.screenWidth = window.innerWidth;
        this.responsiveMenu();
    }

    responsiveMenu() {
        if (window.innerWidth < 576) {
            let leftmenu = this.el.nativeElement.querySelector('.menu-sidebar');
            let layout_content = this.el.nativeElement.querySelector('.layout-content');

            if (this.isCollapsed == false) {
                this.renderer.setStyle(leftmenu, 'display', 'block');
                this.renderer.setStyle(layout_content, 'display', 'none');
            }
            else {
                this.renderer.setStyle(leftmenu, 'display', 'none');
                this.renderer.setStyle(layout_content, 'display', 'flex');

            }
            // this.renderer.setStyle(leftmenu, 'display', 'block');
        }
        else {
            let leftmenu = this.el.nativeElement.querySelector('.menu-sidebar');
            let layout_content = this.el.nativeElement.querySelector('.layout-content');

            this.renderer.setStyle(leftmenu, 'display', 'block');
            this.renderer.setStyle(layout_content, 'display', 'flex');

        }
    }

    isLogged(): boolean {
        if (this.currentUrl == '/login')
            return this.currentUrl == '/login';
        return !Object.keys(this.user).length
    }

    logout(): void {
        // fecha o drawer antes de deslogar para quando entrar novamente ele não estar aberto
        this.close_drawer();
        this.loginService.logout();
    }

    checkPermission(permission: string): boolean {
        return this.storagesService.validateUserPermission(permission);
    }

    /** Portal INOVA THEC — rota imersiva sem shell do app */
    isInovaThecRoute(): boolean {
        const u = (this.currentUrl || '').split('?')[0];
        return u === '/inova-thec' || u.startsWith('/inova-thec/');
    }

}


