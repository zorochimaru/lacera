import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { IntlTelInputComponent } from 'intl-tel-input/angularWithUtils';

import { routerLinks } from '../../../../core';

@Component({
  selector: 'app-notify-on-stock-dialog',
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    RouterLink,
    IntlTelInputComponent
  ],
  templateUrl: './notify-on-stock-dialog.component.html',
  styleUrl: './notify-on-stock-dialog.component.scss'
})
export class NotifyOnStockDialogComponent {
  readonly #dialogRef = inject(DialogRef);
  readonly #fb = inject(FormBuilder);

  protected routerLinks = routerLinks;
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

  protected handleValidityChange(isValid: boolean): void {
    this.isPhoneValid = isValid;
    // Form validation will be triggered automatically when needed
  }

  protected placeNotification(): void {
    const { customerName, customerPhoneNumber, customerEmail } =
      this.contactForm.getRawValue();

    this.#dialogRef.close({
      customerPhoneNumber,
      customerName,
      customerEmail
    });
  }
}
