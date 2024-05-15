import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-custom-sets-section',
  standalone: true,
  imports: [TranslocoModule, NgOptimizedImage],
  templateUrl: './custom-sets-section.component.html',
  styleUrl: './custom-sets-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomSetsSectionComponent {}
