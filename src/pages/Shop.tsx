import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product';
import { products } from '@/data/products';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

const Shop = () => {
  const { category } = useParams<{ category?: string }>();
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const pageTitle = category === 'men' 
    ? 'For Him' 
    : category === 'women' 
    ? 'For Her' 
    : 'All Fragrances';

  const pageDescription = category === 'men'
    ? 'Masculine scents for the modern gentleman'
    : category === 'women'
    ? 'Elegant fragrances for the sophisticated woman'
    : 'Explore our complete collection of premium fragrances';

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
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.reverse();
        break;
      default:
        break;
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
    <div className="space-y-8">
      {!category && (
        <div>
          <h3 className="font-semibold text-foreground mb-4 uppercase tracking-wider text-sm">Category</h3>
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
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor={cat.value} className="text-sm cursor-pointer text-foreground/80">
                  {cat.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-foreground mb-4 uppercase tracking-wider text-sm">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={100}
          step={5}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>€{priceRange[0]}</span>
          <span>€{priceRange[1]}</span>
        </div>
      </div>

      <Separator />

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategories([]);
          setPriceRange([0, 100]);
        }}
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="py-12 lg:py-16 bg-card border-b border-border">
        <div className="container">
          <div className="max-w-2xl animate-fade-in">
            <p className="text-primary font-medium uppercase tracking-[0.2em] mb-2 text-sm">Collection</p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
              {pageTitle}
            </h1>
            <p className="text-lg text-muted-foreground">
              {pageDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-[calc(42px+80px+2rem)] bg-card rounded-lg p-6 border border-border">
                <h2 className="font-semibold text-foreground mb-6 uppercase tracking-wider text-sm">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{filteredProducts.length}</span> products
                </p>
                <div className="flex items-center gap-4">
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-card">
                      <SheetHeader>
                        <SheetTitle className="uppercase tracking-wider text-sm">Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-8">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-44 bg-card">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg text-muted-foreground mb-4">No fragrances match your filters.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategories([]);
                      setPriceRange([0, 100]);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
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
