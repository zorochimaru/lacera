import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import {
  FirestoreCollections,
  OrderFirestore,
  ProductFirestore
} from '../interfaces';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  readonly #fireStoreService = inject(FirestoreService);

  readonly #products = signal<
    { product: ProductFirestore; quantity: number }[]
  >([]);

  public products = this.#products.asReadonly();
  public totalPrice = computed(() =>
    this.products().reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    )
  );
  public totalQuantity = computed(() =>
    this.products().reduce((acc, item) => acc + item.quantity, 0)
  );

  public addProductToOrder(product: ProductFirestore, quantity: number): void {
    this.#products.update(prev => {
      const index = prev.findIndex(item => item.product.id === product.id);
      if (index === -1) {
        return [...prev, { product, quantity }];
      }
      return prev.map(item => ({
        ...item,
        quantity:
          item.product.id === product.id
            ? item.quantity + quantity
            : item.quantity
      }));
    });
  }

  public removeProductFromOrder(productId: string): void {
    this.#products.update(prev =>
      prev.filter(item => item.product.id !== productId)
    );
  }

  public increaseQuantity(productId: string): void {
    this.#products.update(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  public decreaseQuantity(productId: string): void {
    this.#products.update(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }

  public clearOrder(): void {
    this.#products.set([]);
  }

  public checkout(
    customerName: string,
    customerPhoneNumber?: string,
    customerPhoneEmail?: string
  ): Observable<string> {
    const baseOrder = {
      customerName,
      completed: false,
      products: this.#products().map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    return this.#fireStoreService.create<OrderFirestore>(
      FirestoreCollections.orders,
      {
        ...baseOrder,
        customerPhoneNumber: customerPhoneNumber || '',
        customerPhoneEmail: customerPhoneEmail || ''
      }
    );
  }
}
