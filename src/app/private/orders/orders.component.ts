import { CdkTableModule } from '@angular/cdk/table';
import { Component, OnInit, signal } from '@angular/core';

import { OrderFirestore } from '../../core';
import { OrdersService } from './orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CdkTableModule],
  providers: [OrdersService],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  protected readonly orders = signal<OrderFirestore[]>([]);

  public ngOnInit(): void {
    this.orders.set([]);
  }
}
