import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';

import { LangCodes } from '../../core';

@Component({
  selector: 'app-language-select',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './language-select.component.html',
  styleUrl: './language-select.component.scss'
})
export class LanguageSelectComponent {
  readonly #translocoService = inject(TranslocoService);

  public selectedLang = this.#translocoService.getActiveLang();

  protected langCodes = Object.values(LangCodes);

  protected changeLanguage(lang: string): void {
    this.#translocoService.setActiveLang(lang);
    localStorage.setItem('selectedLang', lang);
  }
}
