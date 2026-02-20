import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export const CartDrawer = () => {
  const { isOpen, closeCart, items, removeItem, updateQuantity, totalPrice, subtotalBeforeDiscount, freeItemDiscount, freeItemsCount } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent 
        className="w-full sm:max-w-md bg-background border-l border-border p-0 flex flex-col" 
        hideCloseButton
      >
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
                {items.map((item) => {
                  const cartKey = item.selectedMl ? `${item.product.id}-${item.selectedMl}` : item.product.id;
                  const displayPrice = item.selectedPrice || item.product.price;
                  return (
                    <div key={cartKey} className="flex gap-4">
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
                        {item.selectedMl && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.selectedMl}ml</p>
                        )}
                        <p className="text-sm font-semibold text-foreground mt-1">
                          {formatPrice(displayPrice)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-secondary"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedMl)}
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
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedMl)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-accent h-8 px-2"
                            onClick={() => removeItem(item.product.id, item.selectedMl)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border px-6 py-6">
              {/* Show discount if applicable */}
              {freeItemDiscount > 0 && (
                <div className="mb-4 p-3 bg-accent/10 border border-accent/20">
                  <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                    🎉 Buy 2 Get 1 Free Applied!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {freeItemsCount} free fragrance{freeItemsCount > 1 ? 's' : ''} — You save {formatPrice(freeItemDiscount)}
                  </p>
                </div>
              )}

              {/* Subtotal before discount */}
              {freeItemDiscount > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Subtotal</span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(subtotalBeforeDiscount)}
                  </span>
                </div>
              )}

              {/* Discount line */}
              {freeItemDiscount > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-accent font-medium">Free Fragrance Discount</span>
                  <span className="text-sm text-accent font-medium">
                    -{formatPrice(freeItemDiscount)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-[0.1em]">
                  {freeItemDiscount > 0 ? 'Total' : 'Subtotal'}
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
