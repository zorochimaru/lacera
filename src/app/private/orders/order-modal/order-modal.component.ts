import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import {
  OrderFirestore,
  ProductFirestore,
  ProductsService
} from '../../../core';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [DatePipe],
  providers: [ProductsService],
  templateUrl: './order-modal.component.html',
  styleUrl: './order-modal.component.scss'
})
export class OrderModalComponent implements OnInit {
  readonly #dialogRef = inject(DialogRef);
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

  protected completeOrder(): void {
    if (!confirm('Are you sure you want to complete this order?')) {
      return;
    }
    this.#dialogRef.close(true);
  }

  protected close(): void {
    this.#dialogRef.close();
  }
}
