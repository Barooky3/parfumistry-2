import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = 'ewhz3384@gmail.com';

type Attrs = {
  season: number;
  longevity: number;
  gender_tendency: number;
  uniqueness: number;
};

const DEFAULTS: Attrs = { season: 50, longevity: 50, gender_tendency: 50, uniqueness: 50 };

const FIELDS: Array<{
  key: keyof Attrs;
  label: string;
  left: string;
  right: string;
  center?: string;
}> = [
  { key: 'season', label: 'SEASON', left: 'Summer', right: 'Winter' },
  { key: 'longevity', label: 'LONGEVITY', left: '< 4 hours', right: '> 12 hours' },
  { key: 'gender_tendency', label: 'GENDER TENDENCY', left: 'Masculine', right: 'Feminine', center: 'Unisex' },
  { key: 'uniqueness', label: 'UNIQUENESS', left: 'Mainstream', right: 'Niche' },
];

interface Props {
  productId: string;
}

export const ProductAttributes = ({ productId }: Props) => {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [attrs, setAttrs] = useState<Attrs>(DEFAULTS);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Attrs>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('product_attributes')
        .select('season,longevity,gender_tendency,uniqueness')
        .eq('product_id', productId)
        .maybeSingle();
      if (!cancelled && data) setAttrs(data as Attrs);
    })();
    return () => { cancelled = true; };
  }, [productId]);

  const startEdit = () => {
    setDraft(attrs);
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('product_attributes')
      .upsert({ product_id: productId, ...draft }, { onConflict: 'product_id' });
    setSaving(false);
    if (!error) {
      setAttrs(draft);
      setEditing(false);
    }
  };

  return (
    <div className="relative bg-secondary/40 p-5 md:p-6">
      {isAdmin && !editing && (
        <button
          onClick={startEdit}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground/70 hover:text-foreground transition"
          aria-label="Edit attributes"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      {isAdmin && editing && (
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={save}
            disabled={saving}
            className="p-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
            aria-label="Save"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setEditing(false)}
            className="p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground/70 transition"
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {FIELDS.map((f) => {
          const value = editing ? draft[f.key] : attrs[f.key];
          return (
            <div key={f.key}>
              <p className="text-[11px] font-bold tracking-[0.15em] text-foreground mb-3">
                {f.label}
              </p>
              <div className="relative h-2 bg-muted rounded-sm">
                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-3 h-5 bg-accent",
                    editing ? "cursor-pointer" : ""
                  )}
                  style={{ left: `calc(${value}% - 6px)` }}
                />
                {editing && (
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) =>
                      setDraft({ ...draft, [f.key]: Number(e.target.value) })
                    }
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                )}
              </div>
              <div className={cn("flex mt-2 text-xs text-muted-foreground", f.center ? "justify-between" : "justify-between")}>
                <span>{f.left}</span>
                {f.center && <span>{f.center}</span>}
                <span>{f.right}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
