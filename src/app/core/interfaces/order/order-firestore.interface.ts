import { CommonFirestore } from '../firestore';
import { Order } from './order.interface';

export interface OrderFirestore extends CommonFirestore, Order {}
