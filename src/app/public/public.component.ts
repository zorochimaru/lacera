import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@shared';

@Component({
    imports: [RouterOutlet, FooterComponent],
    templateUrl: './public.component.html',
    styleUrl: './public.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicComponent {}
