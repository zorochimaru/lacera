import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { IntlTelInputComponent } from 'intl-tel-input/angularWithUtils';
import 'intl-tel-input/styles';

import { CartService, routerLinks } from '../../core';
import { IconComponent, InfoDialogComponent } from '../../shared';

@Component({
  selector: 'app-cart',
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    RouterModule,
    IconComponent,
    IntlTelInputComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  readonly #cartService = inject(CartService);
  readonly #dialogRef = inject(DialogRef);
  readonly #router = inject(Router);
  readonly #dialog = inject(Dialog);
  readonly #fb = inject(FormBuilder);
  readonly #transloco = inject(TranslocoService);

  protected products = this.#cartService.products;
  protected totalPrice = this.#cartService.totalPrice();
  protected totalQuantity = this.#cartService.totalQuantity();
  protected isPhoneValid = false;

  protected contactValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const email = control.get('customerEmail')?.value;

    const isEmailValid =
      email &&
      email.includes('@') &&
      email.includes('.') &&
      email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    if (!this.isPhoneValid && !isEmailValid) {
      return { contactRequired: true };
    }

    return null;
  };

  protected contactForm = this.#fb.group(
    {
      customerPhoneNumber: this.#fb.control('+994', {
        nonNullable: true
      }),
      customerEmail: this.#fb.control('', {
        nonNullable: true
      }),
      customerName: this.#fb.control('', {
        validators: [Validators.required],
        nonNullable: true
      }),
      termsAccept: this.#fb.control(false, {
        validators: [Validators.requiredTrue],
        nonNullable: true
      })
    },
    { validators: [this.contactValidator] }
  );

  protected routerLinks = routerLinks;

  protected removeFromCart(productId: string): void {
    this.#cartService.removeProductFromOrder(productId);
  }

  protected checkout(): void {
    this.#dialogRef.close();
    const { customerName, customerPhoneNumber, customerEmail, termsAccept } =
      this.contactForm.getRawValue();

    if (!termsAccept || this.contactForm.invalid) {
      return;
    }

    this.#cartService
      .checkout(customerName, customerPhoneNumber, customerEmail)
      .subscribe({
        next: docId => {
          this.#dialogRef.close();
          this.#cartService.clearOrder();
          this.#router.navigate(['/']).then(() => {
            this.#dialog.open(InfoDialogComponent, {
              data: {
                title: this.#transloco.translate(
                  'common.successMessage'
                ) /** t(common.successMessage) */,
                message: this.#transloco.translate('cart.orderNumber', {
                  id: docId
                }) /** t(cart.orderNumber) */,
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
              ) /** t(common.errorMessage) */,
              icon: 'error',
              type: 'error'
            }
          });
        }
      });
  }
}
