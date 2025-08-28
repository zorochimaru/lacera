import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import {
  OrderFirestore,
  ProductFirestore,
  ProductsService,
  routerLinks
} from '../../../core';
import { IconComponent } from '../../../shared';

@Component({
    selector: 'app-order-modal',
    imports: [DatePipe, IconComponent, RouterModule],
    providers: [ProductsService],
    templateUrl: './order-modal.component.html',
    styleUrl: './order-modal.component.scss'
})
export class OrderModalComponent implements OnInit {
  readonly #dialogRef = inject(DialogRef);
  readonly #router = inject(Router);
  readonly #productsService = inject(ProductsService);

  protected order = inject<OrderFirestore>(DIALOG_DATA);

  protected products = signal<ProductFirestore[]>([]);
  public totalPrice = computed(() =>
    this.products().reduce(
      (acc, product) =>
        acc +
        this.order.products.find(order => order.productId === product.id)
          ?.quantity! *
          product.price,
      0
    )
  );

  protected routerLinks = routerLinks;

  protected getProduct(id: string): ProductFirestore | undefined {
    return this.products().find(product => product.id === id);
  }

  public ngOnInit(): void {
    this.#productsService
      .getProductByIds(this.order.products.map(order => order.productId))
      .subscribe(res => {
        this.products.set(res);
      });
  }

  protected openProductInNewTab(productId: string): void {
    const url = this.#router.serializeUrl(
      this.#router.createUrlTree(['/', routerLinks.productList, productId])
    );

    window.open(url, '_blank');
  }

  protected completeOrder(): void {
    if (!confirm('Are you sure you want to complete this order?')) {
      return;
    }
    this.#dialogRef.close(true);
  }

  protected cancelOrder(): void {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    this.#dialogRef.close(false);
  }

  protected close(): void {
    this.#dialogRef.close();
  }
}
