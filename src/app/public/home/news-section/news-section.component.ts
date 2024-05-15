import { NgIf, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [NgIf, TranslocoModule],
  templateUrl: './news-section.component.html',
  styleUrl: './news-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsSectionComponent {}
