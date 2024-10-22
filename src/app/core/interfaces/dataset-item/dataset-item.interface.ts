import { LangCodes } from '../language-codes.enum';

export interface DatasetItem {
  name: Record<LangCodes, string>;
}
