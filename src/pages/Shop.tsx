import { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/product';
import { products } from '@/data/products';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

// Brand name mapping for display and filtering
const brandMap: Record<string, string[]> = {
  versace: ['Versace'],
  jpg: ['Jean Paul Gaultier', 'JPG'],
  ysl: ['Yves Saint Laurent', 'YSL'],
  azzaro: ['Azzaro'],
  armani: ['Giorgio Armani', 'Armani', 'Emporio Armani'],
  lv: ['Louis Vuitton'],
  pdm: ['Parfums de Marly'],
  creed: ['Creed'],
  mancera: ['Mancera'],
  dior: ['Dior', 'Christian Dior'],
  tomford: ['Tom Ford'],
  viktor: ['Viktor & Rolf'],
  xerjoff: ['Xerjoff'],
};

const brandDisplayNames: Record<string, string> = {
  versace: 'Versace',
  jpg: 'Jean Paul Gaultier',
  ysl: 'Yves Saint Laurent',
  azzaro: 'Azzaro',
  armani: 'Giorgio Armani',
  lv: 'Louis Vuitton',
  pdm: 'Parfums de Marly',
  creed: 'Creed',
  mancera: 'Mancera',
  dior: 'Dior',
  tomford: 'Tom Ford',
  viktor: 'Viktor & Rolf',
  xerjoff: 'Xerjoff',
};

const Shop = () => {
  const { category } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const brandFilter = searchParams.get('brand');
  
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Dynamic page title based on filters
  const getPageTitle = () => {
    if (brandFilter && brandDisplayNames[brandFilter]) {
      return brandDisplayNames[brandFilter];
    }
    if (category === 'men') return 'For Him';
    if (category === 'women') return 'For Her';
    return 'All Fragrances';
  };

  const getPageDescription = () => {
    if (brandFilter && brandDisplayNames[brandFilter]) {
      return `Discover our collection of ${brandDisplayNames[brandFilter]} fragrances`;
    }
    if (category === 'men') return 'Discover masculine scents that leave a lasting impression';
    if (category === 'women') return 'Elegant fragrances crafted for the modern woman';
    return 'Explore our curated collection of premium fragrances';
  };

  const clearBrandFilter = () => {
    searchParams.delete('brand');
    setSearchParams(searchParams);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }

    // Filter by brand if specified
    if (brandFilter && brandMap[brandFilter]) {
      const brandNames = brandMap[brandFilter];
      result = result.filter(p => 
        brandNames.some(brandName => 
          p.brand.toLowerCase().includes(brandName.toLowerCase())
        )
      );
    }
    
    // Filter by category from URL params
    if (category && category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }
    
    // Filter by price range
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.reverse(); break;
    }
    return result;
  }, [category, brandFilter, selectedCategories, priceRange, sortBy, searchQuery]);

  const handleCategoryChange = (cat: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, cat]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    }
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {!category && (
        <div>
          <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-foreground mb-4">Category</h3>
          <div className="space-y-3">
            {[
              { value: 'men', label: 'For Him' },
              { value: 'women', label: 'For Her' },
              { value: 'unisex', label: 'Unisex' },
            ].map((cat) => (
              <div key={cat.value} className="flex items-center gap-3">
                <Checkbox
                  id={cat.value}
                  checked={selectedCategories.includes(cat.value)}
                  onCheckedChange={(checked) => handleCategoryChange(cat.value, checked as boolean)}
                />
                <Label htmlFor={cat.value} className="text-sm cursor-pointer text-muted-foreground">{cat.label}</Label>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-xs font-semibold tracking-[0.1em] uppercase text-foreground mb-4">Price Range</h3>
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={100} step={5} className="mb-3" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>€{priceRange[0]}</span>
          <span>€{priceRange[1]}</span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
        onClick={() => { setSelectedCategories([]); setPriceRange([0, 100]); }}
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-20 border-b border-border">
        <div className="container text-center">
          <p className="text-xs tracking-[0.3em] text-muted-foreground font-medium mb-4 uppercase">Collection</p>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">{getPageTitle()}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">{getPageDescription()}</p>
          
          {/* Active Brand Filter Badge */}
          {brandFilter && brandDisplayNames[brandFilter] && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-sm">
                {brandDisplayNames[brandFilter]}
                <button 
                  onClick={clearBrandFilter}
                  className="hover:text-accent transition-colors"
                  aria-label="Remove brand filter"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Main */}
      <section className="py-10 md:py-14">
        <div className="container">
          {/* Search + Toolbar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search fragrances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-none border-border bg-background"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground">{filteredProducts.length} products</p>
            <div className="flex items-center gap-3">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-2 rounded-none border-foreground">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-background border-r border-border">
                  <SheetHeader>
                    <SheetTitle className="text-left text-base font-semibold tracking-[0.1em] uppercase">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8"><FilterContent /></div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-44 h-10 text-sm bg-background border-border rounded-none">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-[120px]">
                <h2 className="text-xs font-semibold tracking-[0.1em] uppercase text-foreground mb-6">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-6">No products match your filters</p>
                  <Button 
                    variant="outline" 
                    className="rounded-none border-foreground"
                    onClick={() => { setSelectedCategories([]); setPriceRange([0, 100]); }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {filteredProducts.map((product, index) => (
                    <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
