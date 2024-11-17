import { CommonFirestore } from '../firestore';
import { NotifyOnStock } from './notify-on-stock.interface';

export interface NotifyOnStockFirestore
  extends CommonFirestore,
    NotifyOnStock {}
