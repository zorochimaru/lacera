import { Routes } from '@angular/router';
import { routerLinks } from '@core';

export const privateRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./private.component').then(c => c.PrivateComponent),
    children: [
      // {
      //   path: routerLinks.productPanel,
      //   loadComponent: () =>
      //     import('./product-panel/product-panel.component').then(
      //       c => c.ProductPanelComponent
      //     )
      // },
      {
        path: routerLinks.productList,
        loadComponent: () =>
          import('./product-list/product-list.component').then(
            c => c.ProductListComponent
          )
      },
      {
        path: routerLinks.newsList,
        loadComponent: () =>
          import('./news-list/news-list.component').then(
            c => c.NewsListComponent
          )
      },
      {
        path: routerLinks.newsPanel,
        loadComponent: () =>
          import('./news-panel/news-panel.component').then(
            c => c.NewsPanelComponent
          )
      }
    ]
  }
];
