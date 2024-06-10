import { Routes } from '@angular/router';
import { routerLinks } from '@core';

export const publicRoutes: Routes = [
  {
    path: '',

    loadComponent: () =>
      import('./public.component').then(c => c.PublicComponent),

    children: [
      {
        path: '',
        loadComponent: () =>
          import('./home/home.component').then(c => c.HomeComponent)
      },
      {
        path: `${routerLinks.news}/:id`,
        loadComponent: () =>
          import('./news-details/news-details.component').then(
            c => c.NewsDetailsComponent
          )
      }
    ]
  }
];
