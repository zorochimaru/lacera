import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { SwiperContainer } from 'swiper/element';

import { ImageWithPreview } from '../../../../core';
import { IconComponent } from '../../../../shared';

@Component({
  selector: 'app-zoomed-preview',
  standalone: true,
  imports: [IconComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './zoomed-preview.component.html',
  styleUrl: './zoomed-preview.component.scss'
})
export class ZoomedPreviewComponent implements AfterViewInit {
  readonly #data = inject(DIALOG_DATA);
  readonly #dialogRef = inject(DialogRef);

  protected imageSwiper = viewChild<ElementRef<SwiperContainer>>('imageSwiper');

  protected images = signal<ImageWithPreview[]>([]);

  public ngAfterViewInit(): void {
    this.images.set(this.#data.product.images);
    this.imageSwiper()?.nativeElement?.swiper?.slideTo(this.#data.activeIndex);
  }

  protected close(): void {
    this.#dialogRef.close();
  }
}
