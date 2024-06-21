import { LangCodes } from '../language-codes.enum';

export interface News {
  title: Record<LangCodes, string>;
  text: Record<LangCodes, string>;
  coverImgUrl: string;
  imageUrls: string[];
}
