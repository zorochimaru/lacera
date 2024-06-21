import { Directive, inject, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { LangCodes } from '../interfaces';

@Directive({
  selector: 'appCurrLang',
  standalone: true
})
export class CurrentLanguageDirective 
}
