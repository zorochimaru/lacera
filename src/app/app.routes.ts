import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(c => c.LoginComponent)
  },
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./public/public.routes').then(c => c.publicRoutes)
      }
    ]
  },
  { path: '**', redirectTo: '/' }
];
