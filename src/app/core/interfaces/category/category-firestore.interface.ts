import { CommonFirestore } from '../firestore';
import { Category } from './category.interface';

export interface CategoryFirestore extends Category, CommonFirestore {}
