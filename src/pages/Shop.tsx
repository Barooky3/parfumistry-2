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

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

const Shop = () => {
  const { category } = useParams<{ category?: string }>();
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const pageTitle = category === 'men' ? 'Men' : category === 'women' ? 'Women' : 'All Fragrances';
  const pageDescription = category === 'men'
    ? 'Fragrances for men'
    : category === 'women'
    ? 'Fragrances for women'
    : 'Explore our complete collection';

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
                <Label htmlFor={cat.value} className="text-sm cursor-pointer">{cat.label}</Label>
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
        Reset
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-10 md:py-14 bg-secondary border-b border-border">
        <div className="container">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">{pageTitle}</h1>
          <p className="text-muted-foreground mt-1">{pageDescription}</p>
        </div>
      </section>

      {/* Main */}
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-[110px]">
                <h2 className="text-sm font-medium text-foreground mb-4">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Products */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">{filteredProducts.length} products</p>
                <div className="flex items-center gap-3">
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6"><FilterContent /></div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-36 h-9 text-sm">
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

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No products found</p>
                  <Button variant="outline" onClick={() => { setSelectedCategories([]); setPriceRange([0, 100]); }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
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
