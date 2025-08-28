import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-about-us-section',
    imports: [TranslocoModule],
    templateUrl: './about-us-section.component.html',
    styleUrl: './about-us-section.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutUsSectionComponent {}
