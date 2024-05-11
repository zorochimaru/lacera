import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent, HeaderComponent } from './shared';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
