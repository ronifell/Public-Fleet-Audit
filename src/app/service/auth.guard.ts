import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from './login.service';

export const authGuard: CanActivateFn = (route, state) => {

  const servicoLogin = inject(LoginService);
  const router = inject(Router);
  if (servicoLogin.isExpired()) {
    servicoLogin.logout();
    return false;
  }

  const permissions = route.data['permissions'] as string[];
  const userPermissions = servicoLogin.authUser.value.permissions;
  

  const hasAccess = !permissions?.length || userPermissions.some((perm: any) => 
    perm.name === 'ADMIN' || permissions.includes(perm.name)
  );

  if (hasAccess) return true;
  
  router.navigate(['/erro/403']);
  return false;
  
};
