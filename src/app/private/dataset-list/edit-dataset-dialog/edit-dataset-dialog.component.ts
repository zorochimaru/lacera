import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { LangCodes } from '../../../core';

@Component({
    selector: 'app-edit-dataset-dialog',
    imports: [ReactiveFormsModule],
    templateUrl: './edit-dataset-dialog.component.html',
    styleUrl: './edit-dataset-dialog.component.scss'
})
export class EditDatasetDialogComponent implements OnInit {
  readonly #dr = inject(DestroyRef);
  readonly #dialogData = inject<Record<LangCodes, string>>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef);

  protected activeDescriptionLanguage = signal<LangCodes>(LangCodes.az);
  protected langCodes = LangCodes;
  public value = signal<Record<LangCodes, string>>(
    this.#dialogData ||
      Object.fromEntries(Object.values(LangCodes).map(lang => [lang, '']))
  );

  protected inputControl = new FormControl(
    this.value()?.[this.activeDescriptionLanguage()] || ''
  );

  public ngOnInit(): void {
    this.inputControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.#dr)
      )
      .subscribe(value => {
        this.value.update(oldValue => {
          return {
            ...oldValue,
            [this.activeDescriptionLanguage()]: value
          };
        });
      });
  }

  protected onChangeDescriptionLanguage(e: Event): void {
    const newLang = (e.target as HTMLSelectElement).value as LangCodes;
    const inputValue = this.inputControl.getRawValue();
    this.value.update(oldValue => {
      return {
        ...oldValue,
        [this.activeDescriptionLanguage()]: inputValue
      };
    });
    this.activeDescriptionLanguage.set(newLang);
    this.inputControl.setValue(this.value()[newLang]);
  }
}
