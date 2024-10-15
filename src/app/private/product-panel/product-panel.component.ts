import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import {
  combineLatest,
  filter,
  finalize,
  forkJoin,
  of,
  startWith,
  switchMap
} from 'rxjs';
import { register } from 'swiper/element/bundle';

import {
  FirestoreCollections,
  FirestoreService,
  Product,
  ProductFirestore,
  StorageFolders,
  TypedForm,
  UploadService
} from '../../core';
import { IconComponent } from '../../shared';

/**
 * TODO: Add description
 * Save photos on product save only
 * Add image preview before save
 * Order images by drag and drop
 */
register();

interface ProductImage {
  preview: string;
  isCover: boolean;
  file?: File;
}

@Component({
  selector: 'app-product-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    NgxMaskDirective,
    IconComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './product-panel.component.html',
  styleUrl: './product-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductPanelComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #upload = inject(UploadService);
  readonly #firebaseService = inject(FirestoreService);
  readonly #route = inject(ActivatedRoute);
  readonly #dr = inject(DestroyRef);
  // readonly #router = inject(Router);

  protected accept = 'image/webp';
  #limitFileSizeBytes = 2 * 1024 * 1024; // Max file size 2MB

  protected images = signal<ProductImage[]>([]);
  protected previewImage = signal('');
  protected loading = signal(false);
  protected productId = signal('');

  protected showSetCoverButton = computed(
    () =>
      !!this.previewImage() && this.previewImage() !== this.images()[0]?.preview
  );

  protected lengthControl = new FormControl(0, {
    validators: [Validators.required, Validators.min(1)],
    nonNullable: true
  });
  protected widthControl = new FormControl(0);
  protected heightControl = new FormControl(0);

  protected form: TypedForm<Product> = this.#fb.nonNullable.group({
    name: this.#fb.nonNullable.control('', Validators.required),
    description: this.#fb.nonNullable.control('', Validators.required),
    imageUrls: this.#fb.nonNullable.control([] as string[]),
    categoryId: this.#fb.nonNullable.control('', Validators.required),
    price: this.#fb.nonNullable.control(0, [
      Validators.required,
      Validators.min(1)
    ]),
    materialId: this.#fb.nonNullable.control('', Validators.required),
    quantity: this.#fb.nonNullable.control(0, [
      Validators.required,
      Validators.min(1)
    ]),
    size: this.#fb.nonNullable.control('', Validators.required)
  });

  public ngOnInit(): void {
    // TODO: Add fetch method to set init values if has query id param
    this.productId.set(this.#route.snapshot.queryParams['id']);
    if (this.productId()) {
      this.#firebaseService
        .get<ProductFirestore>(FirestoreCollections.products, this.productId())
        .pipe(filter(Boolean), takeUntilDestroyed(this.#dr))
        .subscribe(res => {
          this.form.patchValue(res);
          this.images.set(
            res.imageUrls.map((url, i) => ({ preview: url, isCover: i === 0 }))
          );
          this.setPreviewImage(0);
          const length = res.size.split(' x ')[0];
          const width = res.size.split(' x ')[1];
          const height = res.size.split(' x ')[2];

          this.lengthControl.setValue(Number(length));
          this.widthControl.setValue(Number(width) || 0);
          this.heightControl.setValue(Number(height) || 0);
        });
    }

    combineLatest([
      this.lengthControl.valueChanges.pipe(startWith(0)),
      this.widthControl.valueChanges.pipe(startWith(0)),
      this.heightControl.valueChanges.pipe(startWith(0))
    ]).subscribe(res => {
      if (!res[1] && !res[2]) {
        this.form.controls.size.setValue(`${res[0]}`);
      } else {
        this.form.controls.size.setValue(res.join(' x '));
      }
    });
  }

  protected deleteImage(index: number): void {
    const images = [...this.images()];
    images.splice(index, 1);
    this.images.set(images);
    this.previewImage.set(images[0]?.preview);
  }

  protected setAsCover(): void {
    const images = [...this.images()];
    const coverIndex = images.findIndex(
      img => img.preview === this.previewImage()
    );
    const cover = images.splice(coverIndex, 1)[0];
    images.unshift(cover);
    this.images.set(images);
  }

  protected setPreviewImage(index: number): void {
    this.previewImage.set(this.images()[index].preview);
  }

  protected onFileChange(e: Event): void {
    const fileList = (e.target as HTMLInputElement).files;
    if (fileList?.length) {
      const fileArray = Array.from(fileList);
      const newImagesPayload = fileArray.map(file => ({
        file,
        isCover: false,
        preview: URL.createObjectURL(file)
      }));
      this.images.update(oldValue => [...oldValue, ...newImagesPayload]);

      if (!this.previewImage()) {
        this.images.update(images =>
          images.map((img, i) => ({ ...img, isCover: i === 0 }))
        );
        this.previewImage.set(this.images()[0].preview);
      }
    }
  }

  protected onSubmit(): void {
    if (
      this.form.invalid ||
      this.lengthControl.invalid ||
      !this.images().length
    ) {
      alert('Please fill all fields');
      return;
    }

    if (
      !this.#isAcceptableSize(
        this.images()
          .filter(img => img.file)
          .map(img => img.file!)
      )
    ) {
      alert('Some image size is bigger than 2MB');
      return;
    }

    const payloadForm = this.form.getRawValue();
    this.form.disable();
    this.loading.set(true);

    const imageRequests = this.images().map(img =>
      img.file
        ? this.#upload.upload(img.file, StorageFolders.products)
        : of({ progress: 100, url: img.preview })
    );

    forkJoin(imageRequests)
      .pipe(
        switchMap(res => {
          const uploadedUrls = res.map(x => x.url);
          payloadForm.imageUrls = uploadedUrls;

          if (this.productId()) {
            return this.#firebaseService.update<ProductFirestore>(
              FirestoreCollections.products,
              this.productId(),
              payloadForm
            );
          } else {
            return this.#firebaseService.create<ProductFirestore>(
              FirestoreCollections.products,
              payloadForm
            );
          }
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  #isAcceptableSize(files: File[]): boolean {
    return files.every(file => file.size <= this.#limitFileSizeBytes);
  }

  // public ngOnInit(): void {
  //   this.productId = this.#route.snapshot.queryParams['id'];
  //   if (this.productId) {
  //     this.#firebaseService
  //       .get<ProductFirestore>(FirestoreCollections.products, this.productId)
  //       .pipe(filter(Boolean), takeUntilDestroyed(this.#dr))
  //       .subscribe(res => {
  //         this.form.patchValue(res);
  //       });
  //   }
  // }
  // protected onFileChange(): void {
  //   const files = this.fileInput.nativeElement.files
  //     ? Array.from(this.fileInput.nativeElement.files)
  //     : [];
  //   /**
  //    * Reset the file input value to allow the same file to be selected again
  //    */
  //   this.fileInput.nativeElement.value = '';
  //   if (!files.length) {
  //     return;
  //   }
  //   if (!this.#isAcceptableType(files) || !this.#isAcceptableSize(files)) {
  //     console.error('File type not supported or size not supported');
  //     return;
  //   }
  //   this.files.set(files);
  // }
  // protected onCoverFileChange(): void {
  //   const file = this.fileInput.nativeElement.files?.[0];
  //   /**
  //    * Reset the file input value to allow the same file to be selected again
  //    */
  //   this.fileInput.nativeElement.value = '';
  //   if (!file) {
  //     return;
  //   }
  //   if (!this.#isAcceptableType([file]) || !this.#isAcceptableSize([file])) {
  //     console.error('File type not supported or size not supported');
  //     return;
  //   }
  //   this.coverFile.set(file);
  // }
  // protected deleteImage(url: string): void {
  //   this.form.patchValue({
  //     imageUrl: this.form.value.imageUrl?.filter(imageUrl => imageUrl !== url)
  //   });
  // }
  // protected deleteProduct(): void {
  //   if (confirm('Do you really want to delete?')) {
  //     this.form.disable();
  //     this.loading.set(true);
  //     this.#firebaseService
  //       .delete(FirestoreCollections.news, this.productId)
  //       .pipe(
  //         switchMap(() => {
  //           if (this.form.value.imageUrls?.length) {
  //             const storageRequests = this.form.value.imageUrls?.map(imageUrl =>
  //               this.#upload.remove(imageUrl)
  //             );
  //             return forkJoin(storageRequests);
  //           }
  //           return of(void 0);
  //         }),
  //         finalize(() => {
  //           this.form.disable();
  //           this.loading.set(false);
  //         }),
  //         takeUntilDestroyed(this.#dr)
  //       )
  //       .subscribe(() => this.#backToList());
  //   }
  // }
}
