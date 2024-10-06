import { LangCodes } from '../language-codes.enum';

export interface Product {
  name: Record<LangCodes, string>;
  amount: number;
  description: Record<LangCodes, string>;
  imageUrls: string[];
  price: number;
}
