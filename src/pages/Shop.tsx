import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/product';
import { products } from '@/data/products';
import heroImage from '@/assets/hero-perfumes.jpg';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

const Shop = () => {
  const { category } = useParams<{ category?: string }>();
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const pageTitle = category === 'men' ? 'Men' : category === 'women' ? 'Women' : 'Our Collection';
  const pageDescription = category === 'men'
    ? 'Fragrances for men'
    : category === 'women'
    ? 'Fragrances for women'
    : 'Discover our curated selection of premium fragrances from the world\'s most prestigious houses';

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (category && category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.reverse(); break;
    }
    return result;
  }, [category, selectedCategories, priceRange, sortBy]);

  const handleCategoryChange = (cat: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, cat]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {!category && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Category</h3>
          <div className="space-y-2">
            {[
              { value: 'men', label: 'Men' },
              { value: 'women', label: 'Women' },
              { value: 'unisex', label: 'Unisex' },
            ].map((cat) => (
              <div key={cat.value} className="flex items-center gap-2">
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
        <h3 className="text-sm font-medium text-foreground mb-3">Price Range</h3>
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={100} step={5} className="mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>€{priceRange[0]}</span>
          <span>€{priceRange[1]}</span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => { setSelectedCategories([]); setPriceRange([0, 100]); }}
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section 
        className="relative py-20 md:py-28"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(17,17,22,0.85) 0%, rgba(17,17,22,0.95) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container text-center">
          <p className="text-xs tracking-[0.3em] text-primary font-medium mb-3 uppercase">Premium Fragrances</p>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">{pageTitle}</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">{pageDescription}</p>
        </div>
      </section>

      {/* Main */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground">{filteredProducts.length} fragrances</p>
            <div className="flex items-center gap-3">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-background">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6"><FilterContent /></div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-36 h-9 text-sm bg-secondary border-border">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low-High</SelectItem>
                  <SelectItem value="price-desc">Price: High-Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-[110px]">
                <h2 className="text-sm font-medium text-foreground mb-4">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No products found</p>
                  <Button variant="outline" onClick={() => { setSelectedCategories([]); setPriceRange([0, 100]); }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
