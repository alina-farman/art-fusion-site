// lib/categories.ts
// Art Fusion — Saari categories, subcategories aur mediums

export interface Medium {
  id: string;
  label: string;
}

export interface Subcategory {
  id: string;
  label: string;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  slug: string;
  subcategories: Subcategory[];
  mediums?: Medium[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'paintings',
    label: 'Paintings',
    emoji: '🎨',
    slug: 'paintings',
    subcategories: [
      { id: 'nature',       label: 'Nature' },
      { id: 'calligraphy',  label: 'Calligraphy' },
      { id: 'landscape',    label: 'Landscape' },
      { id: 'portrait',     label: 'Portrait' },
      { id: 'abstract',     label: 'Abstract' },
    ],
    mediums: [
      { id: 'oil_paint',    label: 'Oil Paint' },
      { id: 'acrylic',      label: 'Acrylic Paint' },
      { id: 'resin',        label: 'Resin Coated' },
      { id: 'textured',     label: 'Textured Art' },
    ],
  },
  {
    id: 'sketching',
    label: 'Sketching & Drawing',
    emoji: '✏️',
    slug: 'sketching',
    subcategories: [
      { id: 'pencil',    label: 'Pencil Sketch' },
      { id: 'ink',       label: 'Ink Drawing' },
      { id: 'anime',     label: 'Anime Sketch' },
      { id: 'charcoal',  label: 'Charcoal Drawing' },
    ],
  },
  {
    id: 'digital',
    label: 'Digital Art',
    emoji: '💻',
    slug: 'digital',
    subcategories: [
      { id: 'digital_painting', label: 'Digital Painting' },
      { id: 'graphic_design',   label: 'Graphic Design' },
      { id: 'photography',      label: 'Photography' },
    ],
  },
  {
    id: 'handmade',
    label: '3D & Handmade Art & Craft',
    emoji: '🖐️',
    slug: 'handmade',
    subcategories: [
      { id: 'paper_art',        label: 'Paper Art' },
      { id: 'handmade_cards',   label: 'Handmade Cards' },
      { id: 'resin_art',        label: 'Resin Art' },
      { id: 'metal_art',        label: 'Metal Art' },
      { id: 'wood_art',         label: 'Wood Art' },
      { id: 'clay_art',         label: 'Clay Art' },
      { id: 'crochet',          label: 'Crochet Art' },
      { id: '3d_models',        label: '3D Models' },
      { id: 'jewelry',          label: 'Handmade Jewellery' },
      { id: 'diy_crafts',       label: 'DIY Crafts' },
      { id: 'embroidery',       label: 'Embroidery' },
      { id: 'handmade_decor',   label: 'Handmade Decor' },
    ],
  },
  {
    id: 'cartoon',
    label: 'Cartoon Art',
    emoji: '🎭',
    slug: 'cartoon',
    subcategories: [
      { id: 'cartoon',       label: 'Cartoon Art' },
      { id: 'comic',         label: 'Comic Art' },
      { id: 'illustration',  label: 'Story Illustration' },
      { id: 'anime_art',     label: 'Anime Art' },
    ],
  },
];

export const getCategoryById = (id: string) =>
  CATEGORIES.find(c => c.id === id);

export const getCategoryBySlug = (slug: string) =>
  CATEGORIES.find(c => c.slug === slug);

export function getCategoryInfo(categoryId: string) {
  return CATEGORIES.find(c => c.id === categoryId);
}