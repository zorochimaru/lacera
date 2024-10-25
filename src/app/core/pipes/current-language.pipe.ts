import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  inject,
  OnDestroy,
  Pipe,
  PipeTransform
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { map } from 'rxjs';

import { LangCodes } from '../interfaces';

@Pipe({
  name: 'currLang',
  standalone: true,
  pure: false
})
export class CurrentLanguagePipe implements PipeTransform, OnDestroy {
  readonly #translocoService = inject(TranslocoService);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly #asyncPipe: AsyncPipe = new AsyncPipe(this.#cdr);

  public transform(
    object: Record<LangCodes, string> | null | undefined,
    manualLang?: LangCodes
  ): string | null {
    if (!object) {
      return null;
    }
    return this.#asyncPipe.transform(
      this.#translocoService.langChanges$.pipe(
        map(currLang => object[manualLang || (currLang as LangCodes)])
      )
    );
  }

  public ngOnDestroy() {
    this.#asyncPipe.ngOnDestroy();
  }
}
