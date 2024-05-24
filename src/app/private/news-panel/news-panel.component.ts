import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  FirestoreCollections,
  FirestoreService,
  NewsFirestore,
  NewsImage
} from '@core';
import { filter } from 'rxjs';

@Component({
  selector: 'app-news-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './news-panel.component.html',
  styleUrl: './news-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsPanelComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #df = inject(DestroyRef);
  readonly #route = inject(ActivatedRoute);
  readonly #firebaseService = inject(FirestoreService);
  #newsId = '';

  public ngOnInit(): void {
    this.#newsId = this.#route.snapshot.queryParams['id'];
    if (this.#newsId) {
      this.#firebaseService
        .get<NewsFirestore>(FirestoreCollections.news, this.#newsId)
        .pipe(filter(Boolean), takeUntilDestroyed(this.#df))
        .subscribe(res => {
          this.#fillForm(res);
        });
    }
  }

  protected form = this.#fb.nonNullable.group({
    title: ['', [Validators.required]],
    text: ['', [Validators.required]],
    images: this.#fb.nonNullable.array<{ alt: string; src: string }>([])
  });

  protected onSubmit(): void {
    const values = this.form.getRawValue();

    if (this.#newsId) {
      this.#firebaseService.update<NewsFirestore>(
        FirestoreCollections.news,
        this.#newsId,
        values
      );
    } else {
      this.#firebaseService.create<NewsFirestore>(
        FirestoreCollections.news,
        values
      );
    }
  }

  protected showImage(image: NewsImage): void {}
  protected deleteImage(image: NewsImage): void {}

  #fillForm(values: NewsFirestore): void {
    this.form.patchValue({ title: values.title, text: values.text });
  }
}
