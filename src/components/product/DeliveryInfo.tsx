import { CheckSquare, Truck, MapPin } from 'lucide-react';

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

export const DeliveryInfo = () => {
  const today = new Date();
  
  // Calculate dates
  const orderDate = today;
  const orderReadyStart = new Date(today);
  orderReadyStart.setDate(today.getDate());
  const orderReadyEnd = new Date(today);
  orderReadyEnd.setDate(today.getDate() + 1);
  
  const deliveryStart = new Date(today);
  deliveryStart.setDate(today.getDate() + 8);
  const deliveryEnd = new Date(today);
  deliveryEnd.setDate(today.getDate() + 12);

  return (
    <div className="space-y-3">
      {/* Main message */}
      <div className="bg-secondary/50 border border-border p-4">
        <p className="text-sm text-foreground">
          Order today from our link, and get your package between{' '}
          <span className="font-semibold">{formatDate(deliveryStart)}</span> and{' '}
          <span className="font-semibold">{formatDate(deliveryEnd)}</span>
        </p>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary/30 border border-border p-3 text-center">
          <CheckSquare className="h-5 w-5 mx-auto mb-2 text-foreground" strokeWidth={1.5} />
          <p className="text-xs font-medium text-foreground">Ordered</p>
          <p className="text-xs text-muted-foreground mt-1">{formatDate(orderDate)}</p>
        </div>
        
        <div className="bg-secondary/30 border border-border p-3 text-center">
          <Truck className="h-5 w-5 mx-auto mb-2 text-foreground" strokeWidth={1.5} />
          <p className="text-xs font-medium text-foreground">Order Ready</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(orderReadyStart)} - {formatDate(orderReadyEnd)}
          </p>
        </div>
        
        <div className="bg-secondary/30 border border-border p-3 text-center">
          <MapPin className="h-5 w-5 mx-auto mb-2 text-foreground" strokeWidth={1.5} />
          <p className="text-xs font-medium text-foreground">Delivered</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(deliveryStart)} - {formatDate(deliveryEnd)}
          </p>
        </div>
      </div>
    </div>
  );
};
