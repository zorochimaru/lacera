import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currentLanguage',
  standalone: true
})
export class CurrentLanguagePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
