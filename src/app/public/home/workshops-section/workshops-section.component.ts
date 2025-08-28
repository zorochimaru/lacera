import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-workshops-section',
    imports: [TranslocoModule, NgOptimizedImage],
    templateUrl: './workshops-section.component.html',
    styleUrl: './workshops-section.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkshopsSectionComponent {}
