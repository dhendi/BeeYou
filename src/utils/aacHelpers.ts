import { AACItem } from '../types';

export const getGrammaticalCategoryLabel = (colorType: AACItem['colorType']): string => {
  switch (colorType) {
    case 'subject': return 'Person';
    case 'verb': return 'Verb';
    case 'noun': return 'Noun';
    case 'adjective': return 'Descriptor';
    case 'social': return 'Social';
    case 'emergency': return 'Alert';
    default: return 'Word';
  }
};
