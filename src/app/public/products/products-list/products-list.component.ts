import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { tap } from 'rxjs';

import {
  CurrentLanguagePipe,
  DatasetService,
  FirestoreCollections,
  ProductsService,
  routerLinks
} from '../../../core';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    TranslocoDirective,
    CurrentLanguagePipe,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [ProductsService],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss'
})
export class ProductsListComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #dr = inject(DestroyRef);
  readonly #router = inject(Router);
  readonly #productsService = inject(ProductsService);
  readonly #datasetService = inject(DatasetService);

  protected readonly filterControl = new FormControl('');

  protected categories = toSignal(
    this.#datasetService.getAllDataset(FirestoreCollections.categories),
    { initialValue: [] }
  );
  protected collections = toSignal(
    this.#datasetService.getAllDataset(FirestoreCollections.collections),
    { initialValue: [] }
  );
  protected materials = toSignal(
    this.#datasetService.getAllDataset(FirestoreCollections.materials),
    { initialValue: [] }
  );

  protected products = toSignal(this.#productsService.sourceData$, {
    initialValue: []
  });

  public ngOnInit(): void {
    this.#route.queryParams
      .pipe(
        tap(params => {
          const category = params['categoryId'];
          const collection = params['collectionId'];
          const material = params['materialId'];
          if (category) {
            this.filterControl.setValue(`categoryId-${category}`, {
              emitEvent: false
            });
            this.#productsService.loadNextData(true, ['categoryId', category]);
          }
          if (collection) {
            this.filterControl.setValue(`collectionId-${collection}`, {
              emitEvent: false
            });
            this.#productsService.loadNextData(true, [
              'collectionId',
              collection
            ]);
          }
          if (material) {
            this.filterControl.setValue(`materialId-${material}`, {
              emitEvent: false
            });
            this.#productsService.loadNextData(true, ['materialId', material]);
          }
          if (!category && !collection && !material) {
            this.#productsService.loadNextData(true);
          }
        }),

        takeUntilDestroyed(this.#dr)
      )
      .subscribe();

    this.filterControl.valueChanges.subscribe(value => {
      if (!value) {
        this.#router.navigate(['/', routerLinks.productList]);
      } else {
        const [key, id] = value.split('-');
        this.#router.navigate(['/', routerLinks.productList], {
          queryParams: { [key]: id }
        });
      }
    });
  }
}
