import { LangCodes } from '../language-codes.enum';

export interface Category {
  name: Record<LangCodes, string>;
}
