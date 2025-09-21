
import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthFacade } from './auth.facade';

export const ScopesGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const facade = inject(AuthFacade);
  const scopes = (route.data?.['scopes'] as string[] | undefined) ?? undefined;
  return await facade.ensureAuthenticated(scopes);
};
