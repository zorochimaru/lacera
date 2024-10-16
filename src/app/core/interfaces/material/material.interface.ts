import { LangCodes } from '../language-codes.enum';

export interface Material {
  name: Record<LangCodes, string>;
}
