import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StoragesService {

  private localStorage: Storage;
  private sessionStorage: Storage;

  constructor() { 
    this.localStorage = window.localStorage;
    this.sessionStorage = window.sessionStorage;
  }

  setLocal(key: string, value: any): boolean {
    if (this.localStorage) {
      this.localStorage.setItem(key, JSON.stringify(value));
      return true;
    }
    return false;
  }

  getLocal(key: string): any {
    if (this.localStorage) {
      return JSON.parse(this.localStorage.getItem(key) || '');
    }
    return null;
  }

  removeLocal(key: string): boolean {
    if (this.localStorage) {
      this.localStorage.removeItem(key);
      return true;
    }
    return false;
  }

  clearLocal(): boolean {
    if (this.localStorage) {
      this.localStorage.clear();
      return true;
    }
    return false;
  }
  
  setSession(key: string, value: any): boolean {
    if (this.sessionStorage) {
      this.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    }
    return false;
  }

  getSession(key: string): any {
    if (this.sessionStorage) {
      return JSON.parse(this.sessionStorage.getItem(key) || '{}');
    }
    return null;
  }

  getUser() {
    return this.getSession("USER")
  }

  removeSession(key: string): boolean {
    if (this.sessionStorage) {
      this.sessionStorage.removeItem(key);
      return true;
    }
    return false;
  }

  clearSession(): boolean {
    if (this.sessionStorage) {
      this.sessionStorage.clear();
      return true;
    }
    return false;
  }

  validateUserPermission(permission: string): boolean {
    let user = this.getUser();

    if(!Object.keys(user).length)
        return false;

        for(let userPerm of user['permissions'])
      if(userPerm["name"] == permission || userPerm["name"] == "ADMIN") return true;
    
    return false;

  }

}
