import {
  NgOptimizedImage,
  TitleCasePipe,
  UpperCasePipe
} from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-workshops-section',
  standalone: true,
  imports: [TitleCasePipe, UpperCasePipe, TranslocoModule, NgOptimizedImage],
  templateUrl: './workshops-section.component.html',
  styleUrl: './workshops-section.component.scss'
})
export class WorkshopsSectionComponent {}
