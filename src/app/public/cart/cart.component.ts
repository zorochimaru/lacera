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
import { forkJoin } from 'rxjs';

import {
  CartService,
  NotificationsService,
  NotifyOnStock,
  routerLinks
} from '../../core';
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
  providers: [NotificationsService],
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
  readonly #notificationsService = inject(NotificationsService);

  protected products = this.#cartService.products;
  protected totalPrice = this.#cartService.totalPrice();
  protected totalQuantity = this.#cartService.totalQuantity();
  protected isPhoneValid = false;

  protected contactValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const email = control.get('customerEmail')?.value;
    const phone = control.get('customerPhoneNumber')?.value;

    // Quick check - if we have a valid phone, don't validate further
    if (this.isPhoneValid && phone && phone.length > 5) {
      return null;
    }

    // Only check email if phone is not valid
    const isEmailValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isEmailValid) {
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

  protected handleValidityChange(isValid: boolean): void {
    this.isPhoneValid = isValid;
    // Form validation will be triggered automatically when needed
  }

  protected checkout(): void {
    this.#dialogRef.close();
    const { customerName, customerPhoneNumber, customerEmail, termsAccept } =
      this.contactForm.getRawValue();

    if (!termsAccept || this.contactForm.invalid) {
      return;
    }

    const notification: NotifyOnStock = {
      amount: this.products()
        .map(x => x.quantity)
        .reduce((a, b) => a + b, 0),
      customerPhoneNumber: customerPhoneNumber,
      customerName: customerName,
      customerEmail: customerEmail,
      completed: false,
      productNames: this.products().map(p => p.product.name),
      productIds: this.products().map(p => p.product.id)
    };

    forkJoin([
      this.#cartService.checkout(
        customerName,
        customerPhoneNumber,
        customerEmail
      ),
      this.#notificationsService.sendManagerNotification(notification)
    ]).subscribe({
      next: ([docId]) => {
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
