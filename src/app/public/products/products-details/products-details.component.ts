import { Dialog } from '@angular/cdk/dialog';
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
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { NgxMaskDirective } from 'ngx-mask';
import { filter, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { SwiperContainer } from 'swiper/element';

import {
  CartService,
  CurrentLanguagePipe,
  DatasetItemFirestore,
  DatasetService,
  FirestoreCollections,
  NotificationsService,
  ProductFirestore,
  ProductsService,
  routerLinks
} from '../../../core';
import {
  IconComponent,
  InfoDialog,
  InfoDialogComponent
} from '../../../shared';
import { NotifyOnStockDialogComponent } from './notify-on-stock-dialog/notify-on-stock-dialog.component';

@Component({
  selector: 'app-products-details',
  standalone: true,
  imports: [
    CurrentLanguagePipe,
    TranslocoDirective,
    RouterModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    IconComponent
  ],
  providers: [ProductsService, NotificationsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './products-details.component.html',
  styleUrl: './products-details.component.scss'
})
export class ProductsDetailsComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #productsService = inject(ProductsService);
  readonly #notificationsService = inject(NotificationsService);
  readonly #cartService = inject(CartService);
  readonly #datasetService = inject(DatasetService);
  readonly #dr = inject(DestroyRef);
  readonly #dialog = inject(Dialog);
  readonly #transloco = inject(TranslocoService);

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

  protected notifyOnStock(product: ProductFirestore): void {
    this.#dialog
      .open<{ customerPhoneNumber: string; customerName: string }>(
        NotifyOnStockDialogComponent,
        {
          data: { product }
        }
      )
      .closed.pipe(
        filter(Boolean),
        switchMap(res => {
          return this.#productsService
            .checkIfAlreadyHasNotification(product.id, res.customerPhoneNumber)
            .pipe(map(alreadyHas => (alreadyHas ? null : res)));
        }),
        switchMap(res => {
          if (!res) {
            return of(null);
          }
          return this.#notificationsService.createNotification({
            customerPhoneNumber: res.customerPhoneNumber,
            customerName: res.customerName,
            completed: false,
            productId: product.id
          });
        }),
        takeUntilDestroyed(this.#dr)
      )
      .subscribe(docId => {
        if (!docId) {
          this.#dialog.open<InfoDialog>(InfoDialogComponent, {
            data: {
              title:
                this.#transloco.translate(
                  'common.error'
                ) /** t(common.error) */,
              message: this.#transloco.translate(
                'order.notificationAlreadyExists'
              ) /** t(order.notificationAlreadyExists) */,
              icon: 'error',
              type: 'error'
            }
          });
        } else {
          this.#dialog.open<InfoDialog>(InfoDialogComponent, {
            data: {
              title: this.#transloco.translate(
                'common.successMessage'
              ) /** t(common.successMessage) */,
              message: this.#transloco.translate('order.orderNumber', {
                id: docId
              }) /** t(order.orderNumber) */,
              icon: 'check_circle',
              type: 'success'
            }
          });
        }
      });
  }
}
