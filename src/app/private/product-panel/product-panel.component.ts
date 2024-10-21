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
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
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
  LangCodes,
  Product,
  ProductFirestore,
  StorageFolders,
  TypedForm,
  UploadResult,
  UploadService
} from '../../core';
import { IconComponent } from '../../shared';

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
  readonly #router = inject(Router);

  protected accept = 'image/webp';
  #limitFileSizeBytes = 2 * 1024 * 1024; // Max file size 2MB

  protected images = signal<ProductImage[]>([]);
  protected previewImage = signal('');
  protected loading = signal(false);
  protected productId = signal('');
  protected activeDescriptionLanguage = signal<LangCodes>(LangCodes.az);

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
  protected descriptionLang = new FormControl<LangCodes>(LangCodes.az, {
    nonNullable: true
  });
  protected descriptionControl = new FormControl('', { nonNullable: true });

  protected form: TypedForm<Product> = this.#fb.nonNullable.group({
    name: this.#fb.nonNullable.control('', Validators.required),
    description: this.#fb.nonNullable.control({
      az: '',
      ru: '',
      en: ''
    }),
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

  protected langCodes = LangCodes;
  #imagesToRemove: string[] = [];

  public ngOnInit(): void {
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
          this.descriptionControl.setValue(
            res.description[this.activeDescriptionLanguage()]
          );
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

    this.descriptionControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.#dr)
      )
      .subscribe(value => {
        this.form.controls.description.patchValue({
          ...this.form.controls.description.getRawValue(),
          [this.activeDescriptionLanguage()]: value
        });
      });
  }

  protected onChangeDescriptionLanguage(e: Event): void {
    const newLang = (e.target as HTMLSelectElement).value as LangCodes;
    const descriptionControlValue = this.descriptionControl.getRawValue();
    this.form.controls.description.patchValue({
      ...this.form.controls.description.getRawValue(),
      [this.activeDescriptionLanguage()]: descriptionControlValue
    });

    this.activeDescriptionLanguage.set(newLang);

    this.descriptionControl.setValue(
      this.form.controls.description.getRawValue()[newLang]
    );
  }

  protected deleteImage(index: number): void {
    const images = [...this.images()];
    const deletedImage = images[index];
    if (!deletedImage.file && !confirm('Do you really want to delete?')) {
      return;
    }
    this.#imagesToRemove.push(deletedImage.preview);
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
    images.forEach((img, i) => (img.isCover = i === 0));
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
    payloadForm.name = payloadForm.name.trim().toLocaleUpperCase();
    this.form.disable();
    this.loading.set(true);
    console.log(payloadForm);
    const imageRequests = this.images().map(img =>
      img.file
        ? this.#upload.upload(img.file, StorageFolders.products)
        : of({ progress: 100, url: img.preview })
    );

    const removeImageRequests = this.#imagesToRemove.map(url =>
      this.#upload.remove(url)
    );

    forkJoin([...removeImageRequests, ...imageRequests])
      .pipe(
        switchMap(res => {
          const uploadedUrls = res
            .slice(removeImageRequests.length)
            .filter((x): x is UploadResult => x !== undefined)
            .map(x => x.url);
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
      .subscribe(() =>
        this.#router.navigate(['../'], { relativeTo: this.#route })
      );
  }

  protected deleteProduct(): void {
    if (!confirm('Do you really want to delete?')) {
      return;
    }
    this.loading.set(true);
    const removeImageRequests = this.images()
      .filter(img => !img.file)
      .map(img => this.#upload.remove(img.preview));
    const removeProductRequest = this.#firebaseService.delete(
      FirestoreCollections.products,
      this.productId()
    );
    forkJoin([...removeImageRequests, removeProductRequest])
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() =>
        this.#router.navigate(['../'], { relativeTo: this.#route })
      );
  }

  #isAcceptableSize(files: File[]): boolean {
    return files.every(file => file.size <= this.#limitFileSizeBytes);
  }
}
