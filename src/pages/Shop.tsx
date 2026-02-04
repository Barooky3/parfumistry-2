import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
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

  const pageTitle = category === 'men' 
    ? 'For Him' 
    : category === 'women' 
    ? 'For Her' 
    : 'All Fragrances';

  const pageDescription = category === 'men'
    ? 'Masculine scents for the modern gentleman'
    : category === 'women'
    ? 'Elegant fragrances for the sophisticated woman'
    : 'Explore our complete collection of exquisite fragrances';

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by URL category
    if (category && category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    // Filter by selected categories (if any)
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Filter by price range
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
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
        // Keep original order for 'featured'
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
      {/* Category Filter (only show when not on a category page) */}
      {!category && (
        <div>
          <h3 className="font-medium text-foreground mb-4">Category</h3>
          <div className="space-y-3">
            {[
              { value: 'men', label: 'For Him' },
              { value: 'women', label: 'For Her' },
              { value: 'unisex', label: 'Unisex' },
            ].map((cat) => (
              <div key={cat.value} className="flex items-center gap-2">
                <Checkbox
                  id={cat.value}
                  checked={selectedCategories.includes(cat.value)}
                  onCheckedChange={(checked) => handleCategoryChange(cat.value, checked as boolean)}
                />
                <Label htmlFor={cat.value} className="text-sm cursor-pointer">
                  {cat.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div>
        <h3 className="font-medium text-foreground mb-4">Price Range</h3>
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

      {/* Reset Filters */}
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
      <section className="gradient-hero py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl animate-fade-in">
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
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl p-6 shadow-card">
                <h2 className="font-serif text-lg font-semibold text-foreground mb-6">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} fragrance{filteredProducts.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
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
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-40">
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

              {/* Products */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">No fragrances match your filters.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
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
