import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const CartDrawer = () => {
  const { isOpen, closeCart, items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background border-l border-border z-50 transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-foreground" />
            <h2 className="text-base font-medium text-foreground">Your Cart ({totalItems})</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={closeCart} className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-73px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mb-8">
                Start shopping to add items
              </p>
              <Button onClick={closeCart} asChild>
                <Link to="/shop">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-4 bg-secondary rounded-lg border border-border">
                    <div className="w-20 h-20 bg-card rounded-md overflow-hidden flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.product.category === 'men' ? 'For Him' : item.product.category === 'women' ? 'For Her' : 'Unisex'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 bg-card rounded-lg border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center text-foreground">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border p-5 space-y-4 bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-semibold text-foreground">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxes included. Digital delivery via email.
                </p>
                <Button className="w-full h-12 gap-2 font-medium tracking-wider" size="lg" onClick={closeCart} asChild>
                  <Link to="/checkout">
                    Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={closeCart}>
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
