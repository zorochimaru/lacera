import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

import { IconSpriteComponent } from './shared/icon-sprite/icon-sprite.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, IconSpriteComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
