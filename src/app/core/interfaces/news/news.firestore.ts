import { CommonFirestore } from '../firestore';
import { News } from './news.interface';

export interface NewsFirestore extends CommonFirestore, News {}
