import { AsyncPipe } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { filter, forkJoin, switchMap, tap } from 'rxjs';
import { SwiperContainer } from 'swiper/element';

import {
  CurrentLanguagePipe,
  DatasetItemFirestore,
  DatasetService,
  DatasetViewerPipe,
  FirestoreCollections,
  ProductFirestore,
  ProductsService
} from '../../../core';

@Component({
  selector: 'app-products-details',
  standalone: true,
  imports: [
    CurrentLanguagePipe,
    DatasetViewerPipe,
    AsyncPipe,
    TranslocoDirective
  ],
  providers: [ProductsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './products-details.component.html',
  styleUrl: './products-details.component.scss'
})
export class ProductsDetailsComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #productsService = inject(ProductsService);
  readonly #datasetService = inject(DatasetService);
  readonly #dr = inject(DestroyRef);

  protected previewSwiper = viewChild('previewSwiper');
  protected imageSwiper = viewChild<ElementRef<SwiperContainer>>('imageSwiper');

  protected product = signal<ProductFirestore | null>(null);
  protected category = signal<DatasetItemFirestore | null>(null);
  protected collection = signal<DatasetItemFirestore | null>(null);
  protected material = signal<DatasetItemFirestore | null>(null);

  protected categoryCollection = FirestoreCollections.categories;
  protected collectionCollection = FirestoreCollections.collections;
  protected materialsCollection = FirestoreCollections.materials;

  public ngOnInit(): void {
    this.#route.params
      .pipe(
        switchMap(params => {
          return this.#productsService.getProductById(params['id']);
        }),
        tap(product => this.product.set(product)),
        filter(Boolean),
        switchMap(res => {
          const categoryReq = this.#datasetService.getDatasetById(
            FirestoreCollections.categories,
            res.categoryId
          );
          const collectionReq = this.#datasetService.getDatasetById(
            FirestoreCollections.collections,
            res.collectionId
          );
          const materialReq = this.#datasetService.getDatasetById(
            FirestoreCollections.materials,
            res.materialId
          );
          return forkJoin([categoryReq, collectionReq, materialReq]);
        }),
        tap(([category, collection, material]) => {
          this.category.set(category);
          this.collection.set(collection);
          this.material.set(material);
        }),
        takeUntilDestroyed(this.#dr)
      )
      .subscribe();
  }

  protected selectImage(i: number): void {
    this.imageSwiper()?.nativeElement?.swiper?.slideTo(i);
  }
}
