import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] 
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // it('should open and close the menu correctly when toggleMenu is called', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   app.menuOpen = false;
  //   app.toggleMenu();
  //   expect(app.menuOpen).toBe(true);
  //   app.toggleMenu();
  //   expect(app.menuOpen).toBe(false);
  // });

  // it('should store menuOpen in localStorage when the menu is toggled', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   spyOn(localStorage, 'setItem');
  //   app.menuOpen = false;
  //   app.toggleMenu();
  //   expect(app.menuOpen).toBe(true);
  //   expect(localStorage.setItem).toHaveBeenCalledWith('menuOpen', 'true');
  //   app.toggleMenu();
  //   expect(app.menuOpen).toBe(false);
  //   expect(localStorage.setItem).toHaveBeenCalledWith('menuOpen', 'false');
  // });

  // it('should set userToggledMenu to the same value as menuOpen when the menu is toggled', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   spyOn(localStorage, 'setItem');
  //   app.userToggledMenu = false;
  //   app.toggleMenu();
  //   expect(app.userToggledMenu).toBe(app.menuOpen);
  //   expect(localStorage.setItem).toHaveBeenCalledWith('userToggledMenu', app.menuOpen.toString());
  //   app.toggleMenu();
  //   expect(app.userToggledMenu).toBe(app.menuOpen);
  //   expect(localStorage.setItem).toHaveBeenCalledWith('userToggledMenu', app.menuOpen.toString());
  // });

  // it('should add or remove show class from .container element when the menu is toggled', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   const container = document.createElement('div');
  //   container.classList.add('container');
  //   spyOn(document, 'querySelector').and.returnValue(container);
  //   app.toggleMenu();
  //   expect(container.classList.contains('show')).toBe(true);
  //   app.toggleMenu();
  //   expect(container.classList.contains('show')).toBe(false);
  // });

  // it('should add or remove user-is-tabbing class when the user starts navigating with the Tab key or with the mouse', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   app.ngAfterViewInit();
  //   const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
  //   document.dispatchEvent(tabEvent);
  //   expect(document.body.classList.contains('user-is-tabbing')).toBe(true);
  //   const clickEvent = new MouseEvent('mousedown');
  //   document.dispatchEvent(clickEvent);
  //   expect(document.body.classList.contains('user-is-tabbing')).toBe(false);
  // });

  // it('should call toggleMenu when Enter or Space key is pressed', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   spyOn(app, 'toggleMenu');
  //   app.handleKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));
  //   expect(app.toggleMenu).toHaveBeenCalled();
  //   (app.toggleMenu as jasmine.Spy).calls.reset();
  //   app.handleKeyDown(new KeyboardEvent('keydown', { key: ' ' }));
  //   expect(app.toggleMenu).toHaveBeenCalled();
  // });

  // it('should add a resize event listener to the window in ngOnInit', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   spyOn(window, 'addEventListener');
  //   app.ngOnInit();
  //   expect(window.addEventListener).toHaveBeenCalledWith('resize', jasmine.any(Function));
  // });
  
  // it('should do nothing in toggleMenu if .container does not exist', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   spyOn(document, 'querySelector').and.returnValue(null);
  //   app.toggleMenu();
  //   expect(document.querySelector).toHaveBeenCalledWith('.container');
  // });


});