import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const CartDrawer = () => {
  const { isOpen, closeCart, items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[420px] bg-card shadow-drawer z-50 transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-xl font-semibold">Your Cart</h2>
            <span className="text-sm text-muted-foreground">({totalItems})</span>
          </div>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-[calc(100%-80px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-serif text-foreground mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mb-6">
                Discover our collection of exquisite fragrances
              </p>
              <Button onClick={closeCart} asChild>
                <Link to="/shop">Browse Fragrances</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 bg-background rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-medium text-foreground truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.product.category === 'men' ? 'For Him' : item.product.category === 'women' ? 'For Her' : 'Unisex'}
                      </p>
                      <p className="text-sm font-medium text-primary mt-1">
                        {formatPrice(item.product.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-serif text-xl font-semibold text-foreground">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Shipping calculated at checkout
                </p>
                <Button
                  className="w-full rounded-full"
                  size="lg"
                  onClick={closeCart}
                  asChild
                >
                  <Link to="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
