
export enum ImageStyle {
  REALISTIC = 'Realistic',
  CARTOON = 'Cartoon',
  DIGITAL_ART = 'Digital Art',
  SKETCH = 'Sketch',
  NEON_PUNK = 'Neon Punk',
  MINIMALIST = 'Minimalist'
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: ImageStyle;
  timestamp: number;
}
