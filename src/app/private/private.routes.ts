import { Routes } from '@angular/router';
import { routerLinks } from '@core';

export const privateRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./private.component').then(c => c.PrivateComponent),
    children: [
      {
        path: `${routerLinks.productList}/${routerLinks.productPanel}`,
        loadComponent: () =>
          import('./product/product-panel/product-panel.component').then(
            c => c.ProductPanelComponent
          )
      },
      {
        path: routerLinks.productList,
        loadComponent: () =>
          import('./product/product-list/product-list.component').then(
            c => c.ProductListComponent
          )
      },
      {
        path: routerLinks.datasetList,
        loadComponent: () =>
          import('./dataset-list/dataset-list.component').then(
            c => c.DatasetListComponent
          )
      },
      {
        path: routerLinks.newsList,
        loadComponent: () =>
          import('./news/news-list/news-list.component').then(
            c => c.NewsListComponent
          )
      },
      {
        path: `${routerLinks.newsList}/${routerLinks.newsPanel}`,
        loadComponent: () =>
          import('./news/news-panel/news-panel.component').then(
            c => c.NewsPanelComponent
          )
      }
    ]
  }
];
