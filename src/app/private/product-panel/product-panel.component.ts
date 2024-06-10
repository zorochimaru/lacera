import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FirestoreCollections,
  FirestoreService,
  News,
  NewsFirestore,
  routerLinks,
  StorageFolders,
  UploadResult,
  UploadService
} from '@core';
import {
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  switchMap
} from 'rxjs';

@Component({
  selector: 'app-product-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './product-panel.component.html',
  styleUrl: './product-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductPanelComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #dr = inject(DestroyRef);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #firebaseService = inject(FirestoreService);
  readonly #upload = inject(UploadService);

  @ViewChild('fileInput') protected fileInput!: ElementRef<HTMLInputElement>;

  protected coverFile = signal<File | null>(null);
  protected files = signal<File[]>([]);
  protected loading = signal<boolean>(false);

  protected accept = 'image/webp';
  protected newsId = '';
  #limitFileSizeBytes = 100 * 1024 * 1024;

  protected form = this.#fb.nonNullable.group({
    coverImgUrl: [''],
    title: ['', [Validators.required]],
    text: ['', [Validators.required]],
    imageUrls: this.#fb.nonNullable.control<string[]>([])
  });

  public ngOnInit(): void {
    this.newsId = this.#route.snapshot.queryParams['id'];
    if (this.newsId) {
      this.#firebaseService
        .get<NewsFirestore>(FirestoreCollections.news, this.newsId)
        .pipe(filter(Boolean), takeUntilDestroyed(this.#dr))
        .subscribe(res => {
          this.form.patchValue(res);
        });
    }
  }

  protected onFileChange(): void {
    const files = this.fileInput.nativeElement.files
      ? Array.from(this.fileInput.nativeElement.files)
      : [];

    /**
     * Reset the file input value to allow the same file to be selected again
     */
    this.fileInput.nativeElement.value = '';

    if (!files.length) {
      return;
    }

    if (!this.#isAcceptableType(files) || !this.#isAcceptableSize(files)) {
      console.error('File type not supported or size not supported');
      return;
    }

    this.files.set(files);
  }

  protected onCoverFileChange(): void {
    const file = this.fileInput.nativeElement.files?.[0];

    /**
     * Reset the file input value to allow the same file to be selected again
     */
    this.fileInput.nativeElement.value = '';

    if (!file) {
      return;
    }

    if (!this.#isAcceptableType([file]) || !this.#isAcceptableSize([file])) {
      console.error('File type not supported or size not supported');
      return;
    }

    this.coverFile.set(file);
  }

  protected deleteImage(url: string): void {
    this.form.patchValue({
      imageUrls: this.form.value.imageUrls?.filter(imageUrl => imageUrl !== url)
    });
  }

  protected deleteNews(): void {
    if (confirm('Do you really want to delete?')) {
      this.form.disable();
      this.loading.set(true);

      this.#firebaseService
        .delete(FirestoreCollections.news, this.newsId)
        .pipe(
          switchMap(() => {
            if (this.form.value.imageUrls?.length) {
              const storageRequests = this.form.value.imageUrls?.map(imageUrl =>
                this.#upload.remove(imageUrl)
              );
              return forkJoin(storageRequests);
            }

            return of(void 0);
          }),
          finalize(() => {
            this.form.disable();
            this.loading.set(false);
          }),
          takeUntilDestroyed(this.#dr)
        )
        .subscribe(() => this.#backToList());
    }
  }

  protected onSubmit(): void {
    const values = this.form.getRawValue();
    if (
      (!this.newsId && !this.coverFile()) ||
      (this.newsId && !values.coverImgUrl && !this.coverFile())
    ) {
      alert('cover not found');
      return;
    }
    const imageRequests = [];
    let mainRequest: Observable<void>;
    this.form.disable();
    this.loading.set(true);

    if (this.coverFile()) {
      imageRequests.push(
        this.#upload.upload(this.coverFile()!, StorageFolders.news)
      );
    }

    for (const file of this.files()) {
      imageRequests.push(this.#upload.upload(file, StorageFolders.news));
    }

    if (imageRequests.length) {
      mainRequest = forkJoin(imageRequests).pipe(
        switchMap((res: UploadResult[]) => {
          return this.#upsertNews(
            values,
            res.map(x => x.url)
          );
        })
      );
    } else {
      mainRequest = this.#upsertNews(values);
    }

    mainRequest
      .pipe(
        finalize(() => {
          this.form.disable();
          this.loading.set(false);
        }),
        takeUntilDestroyed(this.#dr)
      )
      .subscribe(() => this.#backToList());
  }

  #upsertNews(values: News, imageUrls?: string[]): Observable<void> {
    if (this.newsId) {
      return this.#firebaseService.update<NewsFirestore>(
        FirestoreCollections.news,
        this.newsId,
        {
          ...values,
          coverImgUrl: imageUrls?.[0] || values.coverImgUrl,
          imageUrls: [...values.imageUrls, ...(imageUrls?.slice(1) || [])]
        }
      );
    } else {
      if (!imageUrls?.[0]) {
        return of(void 0);
      }
      return this.#firebaseService
        .create<NewsFirestore>(FirestoreCollections.news, {
          ...values,
          coverImgUrl: imageUrls?.[0],
          imageUrls: imageUrls || []
        })
        .pipe(map(() => void 0));
    }
  }

  #isAcceptableType(files: File[]): boolean {
    const typesRegexp = new RegExp(this.accept.split(/\s*,\s*/).join('|'));
    return files.every(file => typesRegexp.test(file.type));
  }

  #isAcceptableSize(files: File[]): boolean {
    return files.every(file => file.size <= this.#limitFileSizeBytes);
  }

  #backToList(): void {
    this.#router.navigate(['..', routerLinks.newsList], {
      relativeTo: this.#route
    });
  }
}
