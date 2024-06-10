import { CommonFirestore } from '../firestore';
import { Product } from './product.interface';

export interface ProductFirestore extends Product, CommonFirestore {}
