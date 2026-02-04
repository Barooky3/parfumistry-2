import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
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
          'fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background border-l border-border z-50 transform transition-transform duration-300 ease-out shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-base font-semibold">Bag ({totalItems})</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={closeCart} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-65px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <ShoppingBag className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-base font-medium text-foreground mb-1">Your bag is empty</p>
              <p className="text-sm text-muted-foreground mb-6">
                Add items to get started
              </p>
              <Button onClick={closeCart} size="sm" asChild>
                <Link to="/shop">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 p-3 bg-secondary rounded-xl">
                    <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium text-foreground leading-tight">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.product.category === 'men' ? 'Men' : item.product.category === 'women' ? 'Women' : 'Unisex'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-background rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
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
              <div className="border-t border-border p-4 space-y-3 bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <Button className="w-full gap-2 font-medium rounded-full" size="lg" onClick={closeCart} asChild>
                  <Link to="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
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
