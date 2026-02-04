export type ProductCategory = 'men' | 'women' | 'unisex';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  description: string;
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  image: string;
  affiliateUrl: string;
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
