import { CommonFirestore } from '../firestore';
import { DatasetItem } from './dataset-item.interface';

export interface DatasetItemFirestore extends DatasetItem, CommonFirestore {}
