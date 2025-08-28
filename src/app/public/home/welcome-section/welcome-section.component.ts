import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { StaredOverlayComponent } from '../../../shared';

@Component({
    selector: 'app-welcome-section',
    imports: [TranslocoModule, StaredOverlayComponent],
    templateUrl: './welcome-section.component.html',
    styleUrl: './welcome-section.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WelcomeSectionComponent {}
