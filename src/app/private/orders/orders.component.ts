import { Dialog } from '@angular/cdk/dialog';
import { CdkTableModule } from '@angular/cdk/table';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, switchMap } from 'rxjs';

import { OrderFirestore, ProductsService } from '../../core';
import { OrderModalComponent } from './order-modal/order-modal.component';
import { OrdersService } from './orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CdkTableModule, ReactiveFormsModule],
  providers: [OrdersService, ProductsService],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  readonly #ordersService = inject(OrdersService);
  readonly #productsService = inject(ProductsService);
  readonly #dialog = inject(Dialog);
  readonly #dr = inject(DestroyRef);

  protected readonly orders = toSignal(this.#ordersService.sourceData$);

  protected completedControl = new FormControl(false);

  public ngOnInit(): void {
    this.#ordersService.loadNextData(true, [
      ['completed', '==', this.completedControl.getRawValue()]
    ]);

    this.completedControl.valueChanges.subscribe(res => {
      this.#ordersService.loadNextData(true, [['completed', '==', res]]);
    });
  }

  protected openOrderDetails(order: OrderFirestore): void {
    this.#dialog
      .open(OrderModalComponent, { data: order })
      .closed.subscribe(res => {
        if (res) {
          this.#ordersService
            .updateOrder(order.id, {
              ...order,
              completed: true
            })
            .pipe(
              switchMap(() => {
                return this.#productsService.getProductByIds(
                  order.products.map(p => p.productId)
                );
              }),
              switchMap(products => {
                const requests = products.map(product =>
                  this.#productsService.updateProduct(product.id, {
                    quantity:
                      product.quantity -
                      order.products.find(p => p.productId === product.id)!
                        .quantity
                  })
                );
                return forkJoin(requests);
              }),
              takeUntilDestroyed(this.#dr)
            )
            .subscribe(() =>
              this.#ordersService.loadNextData(true, [
                ['completed', '==', this.completedControl.getRawValue()]
              ])
            );
        }
        if (res === false) {
          this.#ordersService
            .deleteOrder(order.id)
            .subscribe(() =>
              this.#ordersService.loadNextData(true, [
                ['completed', '==', this.completedControl.getRawValue()]
              ])
            );
        }
      });
  }
}
