export type ProductCategory = 'men' | 'women' | 'unisex' | 'bundle';

export interface ProductVariant {
  ml: number;
  price: number;
  originalPrice?: number;
  inStock: boolean;
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
  image: string;
  affiliateUrl: string;
  inStock: boolean;
  featured?: boolean;
  variants?: ProductVariant[]; // ML options
  isBundle?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedMl?: number; // Selected ML variant
  selectedPrice?: number; // Price for selected variant
}
