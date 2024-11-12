import { Routes } from '@angular/router';
import { remoteConfigGuard, RemoteConfigParams, routerLinks } from '@core';

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
        canMatch: [remoteConfigGuard],
        data: {
          rcKey: RemoteConfigParams.homeNews
        },
        loadComponent: () =>
          import('./news-details/news-details.component').then(
            c => c.NewsDetailsComponent
          )
      },
      {
        path: routerLinks.productList,
        loadChildren: () => import('./products/products.routes'),
        canMatch: [remoteConfigGuard],
        data: {
          rcKey: RemoteConfigParams.homeProducts
        }
      },
      {
        path: routerLinks.privacyPolicy,
        loadComponent: () =>
          import('./privacy-policy/privacy-policy.component').then(
            c => c.PrivacyPolicyComponent
          )
      }
    ]
  }
];
