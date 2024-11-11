import { Dialog } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CartService, routerLinks } from '../../../../core';
import { IconComponent, LanguageSelectComponent } from '../../../../shared';
import { CartComponent } from '../../../cart/cart.component';

@Component({
  selector: 'app-products-header',
  standalone: true,
  imports: [RouterModule, LanguageSelectComponent, IconComponent],
  templateUrl: './products-header.component.html',
  styleUrl: './products-header.component.scss'
})
export class ProductsHeaderComponent {
  readonly #cartService = inject(CartService);
  readonly #dialog = inject(Dialog);

  protected readonly totalQuantity = this.#cartService.totalQuantity;

  protected readonly routerLinks = routerLinks;

  protected openCartDialog(): void {
    this.#dialog.open(CartComponent);
  }
}
