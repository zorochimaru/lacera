import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { NgxMaskDirective } from 'ngx-mask';

import { CartService, routerLinks } from '../../core';
import { IconComponent, InfoDialogComponent } from '../../shared';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    RouterModule,
    NgxMaskDirective,
    IconComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  readonly #cartService = inject(CartService);
  readonly #dialogRef = inject(DialogRef);
  readonly #router = inject(Router);
  readonly #dialog = inject(Dialog);
  readonly #transloco = inject(TranslocoService);

  protected products = this.#cartService.products;
  protected totalPrice = this.#cartService.totalPrice();
  protected totalQuantity = this.#cartService.totalQuantity();

  protected customerPhoneNumber = new FormControl('+994', {
    nonNullable: true
  });
  protected customerName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required]
  });
  protected termsAcceptControl = new FormControl(false, {
    validators: [Validators.requiredTrue],
    nonNullable: true
  });
  protected routerLinks = routerLinks;

  protected removeFromCart(productId: string): void {
    this.#cartService.removeProductFromOrder(productId);
  }

  protected checkout(): void {
    this.#dialogRef.close();

    this.#cartService
      .checkout(
        this.customerName.getRawValue(),
        this.customerPhoneNumber.getRawValue()
      )
      .subscribe({
        next: () => {
          this.#dialogRef.close();
          this.#cartService.clearOrder();
          this.#router.navigate(['/']).then(() => {
            this.#dialog.open(InfoDialogComponent, {
              data: {
                title: this.#transloco.translate(
                  'common.successMessage'
                ) /** t("common.successMessage") */,
                message:
                  this.#transloco.translate('cart.orderNumber') /** t() */,
                icon: 'check_circle',
                type: 'success'
              }
            });
          });
        },
        error: () => {
          this.#dialog.open(InfoDialogComponent, {
            data: {
              title: this.#transloco.translate(
                'common.errorMessage'
              ) /** t("common.errorMessage") */,
              icon: 'error',
              type: 'error'
            }
          });
        }
      });
  }
}
