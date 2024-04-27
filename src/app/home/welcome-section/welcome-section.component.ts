import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-welcome-section',
  standalone: true,
  imports: [TranslocoModule, TitleCasePipe, UpperCasePipe],
  templateUrl: './welcome-section.component.html',
  styleUrl: './welcome-section.component.scss'
})
export class WelcomeSectionComponent {}
