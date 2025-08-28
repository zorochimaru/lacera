import { Dialog } from '@angular/cdk/dialog';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CartService, routerLinks } from '../../../core';
import { IconComponent, LanguageSelectComponent } from '../../../shared';
import { CartComponent } from '../../cart/cart.component';

@Component({
  selector: 'app-public-header',
  imports: [RouterModule, LanguageSelectComponent, IconComponent],
  templateUrl: './products-header.component.html',
  styleUrls: ['./products-header.component.scss']
})
export class ProductsHeaderComponent {
  readonly #cartService = inject(CartService);
  readonly #dialog = inject(Dialog);

  protected readonly totalQuantity = this.#cartService.totalQuantity;
  protected readonly routerLinks = routerLinks;

  protected cartUpdated = signal(false);

  constructor() {
    effect(() => {
      this.totalQuantity();

      this.cartUpdated.set(false);

      requestAnimationFrame(() => {
        this.cartUpdated.set(true);
      });
    });
  }

  protected openCartDialog(): void {
    this.#dialog.open(CartComponent);
  }
}
