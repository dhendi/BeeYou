import React from 'react';
import { AppTheme } from '../data/themesData';
import { AACItem } from '../types';

interface AACTileArtProps {
  theme: AppTheme;
  colorType: AACItem['colorType'];
  label: string;
}

/**
 * AACTileArt — Clean, uncluttered background layer for AAC Tiles
 * Following clinical AAC and low-sensory guidelines, backgrounds remain
 * solid and free of distracting patterns, textures, or shapes so symbols
 * remain instantly legible.
 */
export const AACTileArt: React.FC<AACTileArtProps> = () => {
  return null;
};
