import { animate, style, transition, trigger } from '@angular/animations';
import { Dialog } from '@angular/cdk/dialog';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CartService, routerLinks } from '../../../core';
import { IconComponent, LanguageSelectComponent } from '../../../shared';
import { CartComponent } from '../../cart/cart.component';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [RouterModule, LanguageSelectComponent, IconComponent],
  templateUrl: './products-header.component.html',
  styleUrls: ['./products-header.component.scss'],
  animations: [
    trigger('quantityChange', [
      transition(':increment', [
        style({ transform: 'scale(1.5)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)' }))
      ]),
      transition(':decrement', [
        style({ transform: 'scale(1.5)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ProductsHeaderComponent {
  readonly #cartService = inject(CartService);
  readonly #dialog = inject(Dialog);

  protected readonly totalQuantity = this.#cartService.totalQuantity;

  protected readonly routerLinks = routerLinks;

  protected cartUpdated = computed(() => this.totalQuantity() > 0);

  protected openCartDialog(): void {
    this.#dialog.open(CartComponent);
  }
}
