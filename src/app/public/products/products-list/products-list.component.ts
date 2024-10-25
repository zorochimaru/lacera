import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import {
  CurrentLanguagePipe,
  DatasetService,
  FirestoreCollections,
  ProductsService
} from '../../../core';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [TranslocoDirective, CurrentLanguagePipe, RouterModule],
  providers: [ProductsService],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss'
})
export class ProductsListComponent implements OnInit {
  readonly #productsService = inject(ProductsService);
  readonly #datasetService = inject(DatasetService);

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
    this.#productsService.loadNextData(true);
  }
}
