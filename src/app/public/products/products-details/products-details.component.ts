import { AsyncPipe, JsonPipe } from '@angular/common';
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { NgxMaskDirective } from 'ngx-mask';
import { filter, forkJoin, switchMap, tap } from 'rxjs';
import { SwiperContainer } from 'swiper/element';

import {
  CartService,
  CurrentLanguagePipe,
  DatasetItemFirestore,
  DatasetService,
  DatasetViewerPipe,
  FirestoreCollections,
  ProductFirestore,
  ProductsService,
  routerLinks
} from '../../../core';
import { IconComponent } from '../../../shared';

@Component({
  selector: 'app-products-details',
  standalone: true,
  imports: [
    CurrentLanguagePipe,
    DatasetViewerPipe,
    AsyncPipe,
    TranslocoDirective,
    RouterModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    IconComponent,
    JsonPipe
  ],
  providers: [ProductsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './products-details.component.html',
  styleUrl: './products-details.component.scss'
})
export class ProductsDetailsComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #productsService = inject(ProductsService);
  readonly #cartService = inject(CartService);
  readonly #datasetService = inject(DatasetService);
  readonly #dr = inject(DestroyRef);

  protected previewSwiper = viewChild('previewSwiper');
  protected imageSwiper = viewChild<ElementRef<SwiperContainer>>('imageSwiper');

  protected product = signal<ProductFirestore | null>(null);
  protected category = signal<DatasetItemFirestore | null>(null);
  protected collection = signal<DatasetItemFirestore | null>(null);
  protected material = signal<DatasetItemFirestore | null>(null);

  protected productMaxAvailableQuantity = computed(() => {
    const productInCart = this.#cartService
      .products()
      .find(p => p.product.id === this.product()?.id);
    return productInCart
      ? this.product()?.quantity! - productInCart.quantity
      : this.product()?.quantity || 0;
  });

  protected orderLimitReached = computed(() => {
    const productInCart = this.#cartService
      .products()
      .find(p => p.product.id === this.product()?.id);
    return productInCart && productInCart.quantity >= this.product()?.quantity!;
  });

  protected readonly quantityControl = new FormControl(1, {
    nonNullable: true
  });

  protected categoryCollection = FirestoreCollections.categories;
  protected collectionCollection = FirestoreCollections.collections;
  protected materialsCollection = FirestoreCollections.materials;

  protected routerLinks = routerLinks;

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

  protected addToCart(product: ProductFirestore): void {
    this.#cartService.addProductToOrder(
      product,
      this.quantityControl.getRawValue()
    );
  }
}
