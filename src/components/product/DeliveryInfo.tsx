import { CheckSquare, Truck, MapPin } from 'lucide-react';

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

const addBusinessDays = (start: Date, days: number): Date => {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
};

export const DeliveryInfo = () => {
  const today = new Date();

  const orderDate = today;
  const orderReadyEnd = addBusinessDays(today, 2);
  const deliveryStart = addBusinessDays(today, 4);
  const deliveryEnd = addBusinessDays(today, 6);

  return (
    <div className="space-y-2.5">
      {/* Main message */}
      <div className="bg-secondary border border-border/60 rounded-lg px-4 py-3.5">
        <p className="text-sm text-foreground/90">
          Order today, and get your package between{' '}
          <span className="font-semibold text-foreground">{formatDate(deliveryStart)}</span> and{' '}
          <span className="font-semibold text-foreground">{formatDate(deliveryEnd)}</span>
        </p>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-secondary border border-border/40 rounded-lg p-3 text-center">
          <CheckSquare className="h-5 w-5 mx-auto mb-1.5 text-accent" strokeWidth={1.5} />
          <p className="text-[11px] font-medium text-foreground tracking-wide">Ordered</p>
          <p className="text-xs font-semibold text-foreground mt-1">{formatDate(orderDate)}</p>
        </div>

        <div className="bg-secondary border border-border/40 rounded-lg p-3 text-center">
          <Truck className="h-5 w-5 mx-auto mb-1.5 text-accent" strokeWidth={1.5} />
          <p className="text-[11px] font-medium text-foreground tracking-wide">Order Ready</p>
          <p className="text-xs font-semibold text-foreground mt-1">
            {formatDate(orderDate)} – {formatDate(orderReadyEnd)}
          </p>
        </div>

        <div className="bg-secondary border border-border/40 rounded-lg p-3 text-center">
          <MapPin className="h-5 w-5 mx-auto mb-1.5 text-accent" strokeWidth={1.5} />
          <p className="text-[11px] font-medium text-foreground tracking-wide">Delivered</p>
          <p className="text-xs font-semibold text-foreground mt-1">
            {formatDate(deliveryStart)} – {formatDate(deliveryEnd)}
          </p>
        </div>
      </div>
    </div>
  );
};
