import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export const CartDrawer = () => {
  const { isOpen, closeCart, items, removeItem, updateQuantity, totalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-border p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold tracking-[0.1em] uppercase">
              Shopping Cart
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeCart}
              className="h-8 w-8 text-foreground hover:bg-transparent"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-6" strokeWidth={1} />
            <p className="text-base font-medium text-foreground mb-2">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mb-8 text-center">
              Discover our exclusive fragrance collection
            </p>
            <Button
              onClick={closeCart}
              className="h-12 px-8 text-xs font-medium tracking-[0.1em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
              asChild
            >
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <Link
                      to={`/product/${item.product.id}`}
                      onClick={closeCart}
                      className="w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.id}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-foreground hover:text-accent transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        {formatPrice(item.product.price)}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none hover:bg-secondary"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none hover:bg-secondary"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-accent h-8 px-2"
                          onClick={() => removeItem(item.product.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-[0.1em]">
                  Subtotal
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <Button
                className="w-full h-14 text-xs font-medium tracking-[0.15em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
                onClick={closeCart}
                asChild
              >
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button
                variant="ghost"
                className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
