import { NgIf, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [NgIf, TranslocoModule, TitleCasePipe, UpperCasePipe],
  templateUrl: './news-section.component.html',
  styleUrl: './news-section.component.scss'
})
export class NewsSectionComponent {}
