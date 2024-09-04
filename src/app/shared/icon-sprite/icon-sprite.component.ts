import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { tap } from 'rxjs';

import { SanitizePipe } from '../../core';

@Component({
  selector: 'app-icon-sprite',
  standalone: true,
  imports: [AsyncPipe, SanitizePipe],
  templateUrl: './icon-sprite.component.html',
  styleUrl: './icon-sprite.component.scss'
})
export class IconSpriteComponent {
  readonly #http = inject(HttpClient);

  protected icons$ = this.#http
    .get('/assets/icons/sprite.svg', {
      responseType: 'text'
    })
    .pipe(tap(() => console.log('getting icons sprite')));
}

