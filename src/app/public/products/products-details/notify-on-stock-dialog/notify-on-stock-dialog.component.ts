import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { NgxMaskDirective } from 'ngx-mask';

import { routerLinks } from '../../../../core';

@Component({
  selector: 'app-notify-on-stock-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    RouterLink,
    NgxMaskDirective
  ],
  templateUrl: './notify-on-stock-dialog.component.html',
  styleUrl: './notify-on-stock-dialog.component.scss'
})
export class NotifyOnStockDialogComponent {
  readonly #dialogRef = inject(DialogRef);

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

  protected placeNotification(): void {
    this.#dialogRef.close({
      customerPhoneNumber: this.customerPhoneNumber.getRawValue(),
      customerName: this.customerName.getRawValue()
    });
  }
}
