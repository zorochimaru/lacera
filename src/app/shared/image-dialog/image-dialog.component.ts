import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

import { IconComponent } from '../icon';

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './image-dialog.component.html',
  styleUrl: './image-dialog.component.scss'
})
export class ImageDialogComponent {
  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  data: { src: string } = inject(DIALOG_DATA);

  protected onClose(): void {
    this.dialogRef.close();
  }
}
