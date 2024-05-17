import { Routes } from '@angular/router';

import { authGuard } from './core/guards';
import { AuthService } from './core/services';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'private',
    providers: [AuthService],
    canMatch: [authGuard],
    loadChildren: () =>
      import('./private/private.routes').then(c => c.privateRoutes)
  },
  {
    path: '',
    loadChildren: () =>
      import('./public/public.routes').then(c => c.publicRoutes)
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];
