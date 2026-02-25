export type ProductCategory = 'men' | 'women' | 'unisex' | 'bundle';

export interface ProductVariant {
  ml: number;
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

export interface BundleFragrance {
  name: string;
  topNote: string;
  heartNote: string;
  baseNote: string;
  accentColor: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number; // Base price (smallest variant)
  originalPrice?: number;
  category: ProductCategory;
  description: string;
  scentNotes?: {
    top: string[];
    heart: string[];
    base: string[];
  };
  scentNotesImage?: string;
  accentColor?: string; // HSL color matching the bottle/juice
  image: string;
  affiliateUrl: string;
  inStock: boolean;
  featured?: boolean;
  variants?: ProductVariant[]; // ML options
  isBundle?: boolean;
  bundleContents?: BundleFragrance[]; // Fragrances in a bundle
  imagePadding?: string; // Tailwind padding class for image sizing
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedMl?: number; // Selected ML variant
  selectedPrice?: number; // Price for selected variant
}
