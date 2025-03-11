import { ImageWithPreview } from '../firestore';
import { LangCodes } from '../language-codes.enum';

export interface Product {
  name: string;
  quantity: number;
  description: Record<LangCodes, string>;
  categoryId: string;
  collectionId: string;
  imageUrls: string[];
  images?: ImageWithPreview[];
  price: number;
  materialId: string;
  size: string;
}
