import { Route } from '@angular/router';

import { ProductsComponent } from './products.component';

export default [
  {
    path: '',
    component: ProductsComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./products-list/products-list.component').then(
            c => c.ProductsListComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./products-details/products-details.component').then(
            c => c.ProductsDetailsComponent
          )
      }
    ]
  }
] satisfies Route[];
