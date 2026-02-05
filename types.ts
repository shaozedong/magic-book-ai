
export enum ArtStyle {
  GHIBLI = 'Ghibli Anime',
  WATERCOLOR = 'Soft Watercolor',
  OIL_PAINTING = 'Classic Oil Painting',
  STORYBOOK = 'Modern Picture Book'
}

export interface StoryPage {
  id: number;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  style: ArtStyle;
  characterBible: string;
  pages: StoryPage[];
  createdAt: number;
}

export interface StoryGenerationResult {
  title: string;
  characterBible: string;
  pages: {
    text: string;
    imagePrompt: string;
  }[];
}
