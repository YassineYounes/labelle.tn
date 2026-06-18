import { HttpInterceptorFn } from '@angular/common/http';
import { TOKEN_KEY } from './account.service';

/**
 * Attaches the customer JWT to authenticated account calls. Login/register are
 * public, so they are skipped (a stale token must not interfere with login).
 *
 * The token is read straight from localStorage rather than injecting
 * AccountService: the service restores the session from its own constructor
 * (calls `me()`), and injecting it here would create a circular dependency
 * while that request is dispatched mid-construction.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isAccountCall = req.url.includes('/api/account/');
  const isPublic = req.url.includes('/api/account/login') || req.url.includes('/api/account/register');

  if (!isAccountCall || isPublic || typeof localStorage === 'undefined') {
    return next(req);
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
