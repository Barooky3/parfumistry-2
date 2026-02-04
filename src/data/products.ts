import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: 'noir-elixir',
    name: 'Noir Elixir',
    brand: 'ProfParfums Collection',
    price: 45.00,
    originalPrice: 55.00,
    category: 'men',
    description: 'A captivating blend of deep, warm spices and rich woods. Noir Elixir is the essence of evening sophistication and confidence. This fragrance opens with bold black pepper and cardamom, evolving into a heart of dark rose and oud, before settling into a base of smoky vetiver and amber.',
    scentNotes: {
      top: ['Black Pepper', 'Cardamom', 'Bergamot'],
      heart: ['Dark Rose', 'Oud', 'Saffron'],
      base: ['Vetiver', 'Amber', 'Musk'],
    },
    image: '/placeholder.svg',
    affiliateUrl: '#', // Replace with real affiliate URL
    inStock: true,
    featured: true,
  },
  {
    id: 'velvet-rose',
    name: 'Velvet Rose',
    brand: 'ProfParfums Collection',
    price: 52.00,
    category: 'women',
    description: 'An enchanting floral bouquet wrapped in soft velvet elegance. Velvet Rose captures the romance of a blooming garden at dusk. Delicate peony and rose petals dance with hints of raspberry, while a warm vanilla base creates an irresistible, lasting impression.',
    scentNotes: {
      top: ['Raspberry', 'Pink Pepper', 'Pear'],
      heart: ['Damask Rose', 'Peony', 'Magnolia'],
      base: ['Vanilla', 'White Musk', 'Sandalwood'],
    },
    image: '/placeholder.svg',
    affiliateUrl: '#', // Replace with real affiliate URL
    inStock: true,
    featured: true,
  },
  {
    id: 'amber-intense',
    name: 'Amber Intense',
    brand: 'ProfParfums Collection',
    price: 48.00,
    originalPrice: 60.00,
    category: 'unisex',
    description: 'A bold, modern interpretation of classic amber. Amber Intense is for those who dare to make a statement. This unisex fragrance combines rich amber with contemporary freshness, creating a unique scent that transitions seamlessly from day to night.',
    scentNotes: {
      top: ['Mandarin', 'Pink Pepper', 'Aldehydes'],
      heart: ['Amber', 'Benzoin', 'Labdanum'],
      base: ['Tonka Bean', 'Cedar', 'Leather'],
    },
    image: '/placeholder.svg',
    affiliateUrl: '#', // Replace with real affiliate URL
    inStock: true,
    featured: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return products;
  return products.filter(product => product.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};
