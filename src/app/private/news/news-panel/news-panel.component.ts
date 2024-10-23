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
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  commonConstants,
  FirestoreCollections,
  FirestoreService,
  News,
  NewsFirestore,
  routerLinks,
  StorageFolders,
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

// TODO: add thumbnails urls for gallery images
@Component({
  selector: 'app-news-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './news-panel.component.html',
  styleUrl: './news-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsPanelComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #dr = inject(DestroyRef);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #firebaseService = inject(FirestoreService);
  readonly #upload = inject(UploadService);

  @ViewChild('fileInput') protected fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('filesInput') protected filesInput!: ElementRef<HTMLInputElement>;

  protected files = signal<File[]>([]);
  protected loading = signal<boolean>(false);

  protected accept = 'image/webp';
  protected newsId = '';
  #limitFileSizeBytes = commonConstants.imageFileSizeLimit;

  protected form = this.#fb.nonNullable.group({
    title: this.#fb.nonNullable.group({ az: '', ru: '', en: '' }),
    text: this.#fb.nonNullable.group({ az: '', ru: '', en: '' }),
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
    const files = this.filesInput.nativeElement.files
      ? Array.from(this.filesInput.nativeElement.files)
      : [];

    /**
     * Reset the file input value to allow the same file to be selected again
     */
    this.filesInput.nativeElement.value = '';

    if (!files.length) {
      return;
    }

    if (!this.#isAcceptableType(files) || !this.#isAcceptableSize(files)) {
      console.error('File type not supported or size not supported');
      return;
    }
    this.files.set(files);
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

    this.form.disable();
    this.loading.set(true);
    commonConstants.imageFileSizeLimit;
    // Gallery images
    const imageRequests = [];
    for (const file of this.files()) {
      imageRequests.push(this.#upload.upload(file, StorageFolders.news));
    }
    // Main request
    let mainRequest$!: Observable<void>;
    if (imageRequests.length) {
      mainRequest$ = forkJoin([...imageRequests]).pipe(
        switchMap(([...imagesRes]) => {
          return this.#upsertNews(
            values,
            imagesRes?.map(x => x.url)
          );
        })
      );
    } else {
      mainRequest$ = this.#upsertNews(values);
    }

    mainRequest$
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
          imageUrls: [...values.imageUrls, ...(imageUrls || [])]
        }
      );
    } else {
      return this.#firebaseService
        .create<NewsFirestore>(FirestoreCollections.news, {
          ...values,
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
